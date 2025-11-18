#!/bin/bash

# Deploy Expense Manager Backend to Google Cloud Run
# This script assumes you have gcloud CLI installed and configured

# Set your project ID
PROJECT_ID="your-project-id"
SERVICE_NAME="expense-manager-backend"
REGION="us-central1"

# Build and deploy the container
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/expense-manager-backend \
  --platform managed \
  --region $REGION \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --concurrency 80 \
  --env-vars-file .env \
  --allow-unauthenticated

echo "Deployment completed. Your service is available at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'