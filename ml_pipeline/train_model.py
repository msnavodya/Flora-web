"""
TensorFlow CNN image classification training script.

This version uses a real train/validation split, class weighting, and saves
class labels alongside the trained model so backend inference stays aligned.
"""

import json
import os
import sys
from pathlib import Path
from typing import Tuple

import numpy as np
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.layers import BatchNormalization, Conv2D, Dense, Dropout, Flatten, MaxPooling2D
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

try:
    from config import DATASET_CONFIG, MODEL_CONFIG
except ImportError:
    print("ERROR: config.py not found. Copy config_template.py to config.py first.")
    sys.exit(1)


class ImageClassificationModel:
    """Build and train a CNN model for image classification."""

    def __init__(self, config: dict):
        self.config = config
        self.image_size = config["image_size"]
        self.batch_size = config["batch_size"]
        self.epochs = config["epochs"]
        self.training_split = float(config.get("training_split", 0.8))
        self.validation_split = max(0.05, min(0.5, 1 - self.training_split))
        self.model = None
        self.history = None
        self.class_names = []

        print("Model configuration loaded")
        print(f"  Image size: {self.image_size}")
        print(f"  Batch size: {self.batch_size}")
        print(f"  Epochs: {self.epochs}")
        print(f"  Training split: {self.training_split:.2f}")
        print(f"  Validation split: {self.validation_split:.2f}\n")

    def validate_dataset(self, dataset_dir: str) -> Tuple[bool, int, list]:
        """Validate dataset structure and count classes."""
        try:
            print("Validating dataset structure...")

            dataset_path = Path(dataset_dir)
            if not dataset_path.exists():
                print(f"Dataset folder not found: {dataset_dir}")
                return False, 0, []

            class_dirs = [entry for entry in dataset_path.iterdir() if entry.is_dir()]
            if not class_dirs:
                print("No class folders found. Expected dataset/class_name/*.jpg")
                return False, 0, []

            class_names = []
            total_images = 0

            for class_dir in sorted(class_dirs):
                image_files = [
                    item
                    for item in class_dir.iterdir()
                    if item.suffix.lower() in [".jpg", ".jpeg", ".png", ".gif", ".bmp"]
                ]
                if image_files:
                    class_names.append(class_dir.name)
                    total_images += len(image_files)
                    print(f"  {class_dir.name}: {len(image_files)} images")

            if len(class_names) < 2:
                print("Need at least two classes with images to train.")
                return False, 0, []

            print("\nDataset validated")
            print(f"  Total classes: {len(class_names)}")
            print(f"  Total images: {total_images}\n")
            return True, len(class_names), class_names
        except Exception as error:
            print(f"Dataset validation failed: {error}")
            return False, 0, []

    def build_model(self, num_classes: int) -> Sequential:
        """Build the CNN architecture."""
        print("Building CNN model...")

        model = Sequential(
            [
                Conv2D(32, (3, 3), activation="relu", input_shape=(*self.image_size, 3), padding="same"),
                BatchNormalization(),
                Conv2D(32, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                MaxPooling2D((2, 2)),
                Dropout(0.25),
                Conv2D(64, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                Conv2D(64, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                MaxPooling2D((2, 2)),
                Dropout(0.25),
                Conv2D(128, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                Conv2D(128, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                MaxPooling2D((2, 2)),
                Dropout(0.3),
                Conv2D(256, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                Conv2D(256, (3, 3), activation="relu", padding="same"),
                BatchNormalization(),
                MaxPooling2D((2, 2)),
                Dropout(0.35),
                Flatten(),
                Dense(512, activation="relu"),
                Dropout(0.5),
                Dense(256, activation="relu"),
                Dropout(0.5),
                Dense(num_classes, activation="softmax"),
            ]
        )

        model.compile(
            optimizer=Adam(learning_rate=self.config["learning_rate"]),
            loss="categorical_crossentropy",
            metrics=["accuracy"],
        )

        self.model = model
        model.summary()
        print()
        return model

    def create_data_generators(self, dataset_dir: str) -> Tuple:
        """Create training and validation generators with a real split."""
        print("Creating data generators...\n")

        train_datagen = ImageDataGenerator(
            rescale=1.0 / 255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            shear_range=0.2,
            fill_mode="nearest",
            validation_split=self.validation_split,
        )
        validation_datagen = ImageDataGenerator(
            rescale=1.0 / 255,
            validation_split=self.validation_split,
        )

        train_generator = train_datagen.flow_from_directory(
            dataset_dir,
            target_size=self.image_size,
            batch_size=self.batch_size,
            class_mode="categorical",
            subset="training",
            seed=42,
            shuffle=True,
        )
        validation_generator = validation_datagen.flow_from_directory(
            dataset_dir,
            target_size=self.image_size,
            batch_size=self.batch_size,
            class_mode="categorical",
            subset="validation",
            seed=42,
            shuffle=False,
        )

        self.class_names = [
            class_name for class_name, _ in sorted(train_generator.class_indices.items(), key=lambda item: item[1])
        ]

        print("Data generators created")
        print(f"  Training samples: {train_generator.samples}")
        print(f"  Validation samples: {validation_generator.samples}")
        print(f"  Classes: {', '.join(self.class_names)}\n")

        return train_generator, validation_generator

    def build_class_weights(self, train_generator) -> dict:
        """Use inverse-frequency class weights for imbalanced datasets."""
        class_counts = np.bincount(train_generator.classes)
        total_samples = int(np.sum(class_counts))
        class_weights = {}

        for class_index, class_count in enumerate(class_counts):
            if class_count == 0:
                class_weights[class_index] = 1.0
            else:
                class_weights[class_index] = total_samples / (len(class_counts) * class_count)

        print("Class weights:")
        for class_index, weight in class_weights.items():
            label = self.class_names[class_index] if class_index < len(self.class_names) else str(class_index)
            print(f"  {label}: {weight:.4f}")
        print()

        return class_weights

    def train(self, train_generator, validation_generator):
        """Train the model."""
        try:
            print("Starting model training...\n")

            steps_per_epoch = max(1, int(np.ceil(train_generator.samples / self.batch_size)))
            validation_steps = max(1, int(np.ceil(validation_generator.samples / self.batch_size)))
            class_weights = self.build_class_weights(train_generator)

            print("Training configuration:")
            print(f"  Steps per epoch: {steps_per_epoch}")
            print(f"  Validation steps: {validation_steps}\n")

            callbacks = [
                EarlyStopping(
                    monitor="val_loss",
                    patience=5,
                    restore_best_weights=True,
                    verbose=1,
                ),
                ModelCheckpoint(
                    self.config.get("best_model_path", "best_model.keras"),
                    monitor="val_loss",
                    save_best_only=True,
                    verbose=1,
                ),
                ReduceLROnPlateau(
                    monitor="val_loss",
                    factor=0.5,
                    patience=2,
                    min_lr=1e-6,
                    verbose=1,
                ),
            ]

            history = self.model.fit(
                train_generator,
                steps_per_epoch=steps_per_epoch,
                epochs=self.epochs,
                validation_data=validation_generator,
                validation_steps=validation_steps,
                callbacks=callbacks,
                class_weight=class_weights,
                verbose=1,
            )

            self.history = history
            return history
        except Exception as error:
            print(f"\nTraining failed: {error}")
            return None

    def save_model(self, save_path: str) -> bool:
        """Save the trained model to disk."""
        try:
            if self.model is None:
                print("Model not trained yet.")
                return False

            save_dir = os.path.dirname(save_path)
            if save_dir:
                os.makedirs(save_dir, exist_ok=True)

            self.model.save(save_path)
            print(f"\nModel saved successfully: {os.path.abspath(save_path)}")
            return True
        except Exception as error:
            print(f"Error saving model: {error}")
            return False

    def save_class_names(self, save_path: str) -> bool:
        """Save the class labels used during training."""
        try:
            if not self.class_names:
                print("No class names available to save.")
                return False

            save_dir = os.path.dirname(save_path)
            if save_dir:
                os.makedirs(save_dir, exist_ok=True)

            with open(save_path, "w", encoding="utf-8") as handle:
                json.dump(self.class_names, handle, indent=2)

            print(f"Class names saved successfully: {os.path.abspath(save_path)}")
            return True
        except Exception as error:
            print(f"Error saving class names: {error}")
            return False

    def plot_training_history(self) -> None:
        """Plot and save training accuracy and loss graphs."""
        if self.history is None:
            print("No training history available.")
            return

        try:
            import matplotlib.pyplot as plt

            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

            ax1.plot(self.history.history["accuracy"], label="Training Accuracy")
            ax1.plot(self.history.history["val_accuracy"], label="Validation Accuracy")
            ax1.set_xlabel("Epoch")
            ax1.set_ylabel("Accuracy")
            ax1.set_title("Model Accuracy")
            ax1.legend()
            ax1.grid(True)

            ax2.plot(self.history.history["loss"], label="Training Loss")
            ax2.plot(self.history.history["val_loss"], label="Validation Loss")
            ax2.set_xlabel("Epoch")
            ax2.set_ylabel("Loss")
            ax2.set_title("Model Loss")
            ax2.legend()
            ax2.grid(True)

            plt.tight_layout()
            plt.savefig("training_history.png", dpi=100)
            print("\nTraining history plot saved: training_history.png")
        except Exception as error:
            print(f"\nCould not plot training history: {error}")


def main():
    """Main execution function."""
    print("\n" + "=" * 60)
    print("TensorFlow CNN Image Classifier")
    print("=" * 60 + "\n")

    model_trainer = ImageClassificationModel({**MODEL_CONFIG, **DATASET_CONFIG})

    dataset_dir = DATASET_CONFIG["local_dataset_dir"]
    is_valid, num_classes, class_names = model_trainer.validate_dataset(dataset_dir)

    if not is_valid:
        print("Cannot proceed without a valid labeled dataset.")
        sys.exit(1)

    print(f"Classes: {', '.join(class_names)}\n")

    model_trainer.build_model(num_classes)
    train_gen, val_gen = model_trainer.create_data_generators(dataset_dir)
    history = model_trainer.train(train_gen, val_gen)

    if history is None:
        print("\nTraining failed.")
        sys.exit(1)

    model_trainer.save_model(MODEL_CONFIG["model_save_path"])
    model_trainer.save_class_names(MODEL_CONFIG.get("class_names_save_path", "./class_names.json"))
    model_trainer.plot_training_history()

    print("\n" + "=" * 60)
    print("Training complete")
    print("=" * 60)
    print(f"\nFinal results:")
    print(f"  Training Accuracy:   {history.history['accuracy'][-1]:.4f}")
    print(f"  Validation Accuracy: {history.history['val_accuracy'][-1]:.4f}")
    print(f"  Training Loss:       {history.history['loss'][-1]:.4f}")
    print(f"  Validation Loss:     {history.history['val_loss'][-1]:.4f}\n")


if __name__ == "__main__":
    main()
