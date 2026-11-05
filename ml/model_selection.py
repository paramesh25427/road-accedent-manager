"""
Model Definition, Training, and Selection Module
Trains Logistic Regression, Decision Tree, Random Forest, and XGBoost.
Compares performance and selects the optimal model.
"""

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from .evaluate import evaluate_model, extract_feature_importance

def get_candidate_models(random_state=42):
    """Returns the dictionary of 4 candidate classification models."""
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            random_state=random_state
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=12,
            min_samples_split=8,
            min_samples_leaf=4,
            random_state=random_state
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=150,
            max_depth=14,
            min_samples_split=6,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=random_state,
            eval_metric="mlogloss"
        )
    }

def train_and_compare_all_models(X_train, y_train, X_test, y_test, feature_names):
    """
    Trains all 4 candidate models, calculates performance metrics,
    and returns full comparison results along with the best model.
    """
    models = get_candidate_models()
    all_metrics = {}
    trained_models = {}
    all_feature_importances = {}
    
    best_model_name = None
    best_f1 = -1.0
    
    print("\n" + "="*70)
    print(f"{'Model':<22} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("="*70)
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        metrics = evaluate_model(model, X_test, y_test)
        all_metrics[name] = metrics
        
        # Calculate feature importance for this model
        importances = extract_feature_importance(model, feature_names)
        all_feature_importances[name] = importances
        
        print(f"{name:<22} | {metrics['accuracy']:<10.4f} | {metrics['precision']:<10.4f} | {metrics['recall']:<10.4f} | {metrics['f1_score']:<10.4f}")
        
        # Selection criterion: primary weighted F1-score with accuracy tiebreaker
        score = metrics["f1_score"]
        if score > best_f1:
            best_f1 = score
            best_model_name = name
            
    print("="*70)
    print(f"Selected Best Model: {best_model_name} (F1 Score: {best_f1:.4f})\n")
    
    return {
        "best_model_name": best_model_name,
        "best_model": trained_models[best_model_name],
        "trained_models": trained_models,
        "all_metrics": all_metrics,
        "all_feature_importances": all_feature_importances
    }
