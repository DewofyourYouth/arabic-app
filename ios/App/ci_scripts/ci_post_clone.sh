#!/bin/sh

# Xcode Cloud runs this script after cloning the repository but before building the iOS app.
# We need to use this step to build our web application and sync the assets to iOS.

echo "Installing Node.js..."
brew install node

echo "Navigating to project root..."
cd $CI_WORKSPACE

echo "Installing project dependencies..."
npm install

echo "Building production web bundle..."
npm run build

echo "Syncing Capacitor to iOS..."
npx cap sync ios

echo "Web assets successfully injected! Xcode will now archive the app."
