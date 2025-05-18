#!/bin/bash

NAMESPACE=$1

if [ -z "$NAMESPACE" ]; then
  NAMESPACE="default"
fi

echo "Deploying service into k8s namespace ${NAMESPACE}"

# Ensure namespace exists
kubectl create namespace "$NAMESPACE" || echo "Namespace $NAMESPACE already exists."

# Apply deployment and service manifests
kubectl -n "$NAMESPACE" apply -f deployment.yaml
kubectl -n "$NAMESPACE" apply -f service.yaml

# Restart service pods
kubectl rollout restart deployment my-node-app --namespace="$NAMESPACE"

# Ensure deployment status
kubectl rollout status deployment my-node-app --namespace="$NAMESPACE"

echo "Deployment to Kubernetes in namespace ${NAMESPACE} completed successfully."
