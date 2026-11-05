"""
Model Evaluation and Metrics Module
Calculates Accuracy, Precision, Recall, F1-Score (Macro & Weighted),
Confusion Matrix, and Feature Importances for trained ML models.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def evaluate_model(model, X_test, y_test, class_names=["Low", "Medium", "High"]):
    """
    Evaluates a trained classifier and returns a comprehensive metrics dictionary.
    """
    y_pred = model.predict(X_test)
    
    # Calculate core classification metrics
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    recall = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_list = cm.tolist()
    
    # Per-class report
    clf_report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)
    
    metrics = {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "macro_f1": round(macro_f1, 4),
        "confusion_matrix": cm_list,
        "classification_report": clf_report
    }
    
    return metrics

def extract_feature_importance(model, feature_names):
    """
    Extracts and ranks feature importance for Random Forest, XGBoost, Decision Tree,
    or normalized absolute coefficients for Logistic Regression.
    """
    importance_dict = {}
    
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        for name, score in zip(feature_names, importances):
            importance_dict[name] = float(score)
    elif hasattr(model, "coef_"):
        # For multi-class Logistic Regression, average absolute coefficients across classes
        coef_abs_mean = np.mean(np.abs(model.coef_), axis=0)
        norm_coefs = coef_abs_mean / np.sum(coef_abs_mean)
        for name, score in zip(feature_names, norm_coefs):
            importance_dict[name] = float(score)
            
    # Sort descending
    sorted_importances = sorted(
        [{"feature": k, "importance": round(v, 4), "percentage": round(v * 100, 2)} for k, v in importance_dict.items()],
        key=lambda x: x["importance"],
        reverse=True
    )
    
    return sorted_importances
