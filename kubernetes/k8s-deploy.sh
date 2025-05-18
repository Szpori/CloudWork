NAMESPACE=$1
if [ -z "$NAMESPACE" ]; then
  NAMESPACE="local-dev"
fi

# change to true in case of need deleting resources first
DELETE_BEFORE_DEPLOY="false"

echo "Deploying service into k8s namespace ${NAMESPACE}"

kubectl create namespace "$NAMESPACE" 2>/dev/null || true

# optionally delete the existing resources
if [ "$DELETE_BEFORE_DEPLOY" == "true" ]; then
  echo "Deleting the existing resources..."
  kubectl delete service my-node-app-service -n="$NAMESPACE"
  kubectl delete deployment my-node-app -n="$NAMESPACE"
fi

# Apply the YAML files located in the root directory
kubectl apply -f ../deployment.yaml -n="$NAMESPACE"
kubectl apply -f ../service.yaml -n="$NAMESPACE"

# Restart the deployment
kubectl rollout restart deployment my-node-app --namespace=$NAMESPACE

# Check rollout status
kubectl rollout status deployment my-node-app --namespace=$NAMESPACE

echo "Deployment to Kubernetes in namespace ${NAMESPACE} completed successfully."
