name: Deploy to GitHub Pages

# Runs automatically every time you push/upload changes to the main branch.
# GitHub's own servers do the build — nothing needs to run on your computer.

on:
  push:
    branches: ["main"]
  workflow_dispatch: # lets you manually re-run it from the Actions tab too

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build the site
        run: npm run build

      - name: Prepare GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload built site
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
