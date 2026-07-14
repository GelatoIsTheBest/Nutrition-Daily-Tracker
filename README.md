# Pushing Sustenance to GitHub — Complete Beginner's Guide

There are two ways to do this. **Option A needs no terminal at all** — just
your browser, dragging and dropping files. **Option B** uses the terminal
and is slightly more "standard" if you ever want to make quick updates later.
Start with Option A.

---

# Option A: Browser only, no terminal (recommended)

## Step 1: Unzip the project

Unzip `sustenance-app.zip` somewhere on your computer (Desktop is fine). You
should see a `sustenance-app` folder containing `package.json`, a `src`
folder, a `.github` folder, and a few other files.

## Step 2: Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: e.g. `sustenance-nutrition-tracker`
3. Keep it **Public** (required for free GitHub Pages)
4. **Do NOT** check "Add a README" or any initialization option — leave it
   completely empty
5. Click **Create repository**

## Step 3: Upload the files by dragging and dropping

**Important first — on a Mac, the `.github` folder won't be visible in
Finder by default**, because Mac hides anything starting with a dot. This
folder is essential (it's what makes the automatic build work), so before
dragging anything, press **Cmd + Shift + Period (.)** while Finder is open
to reveal hidden files. Press the same shortcut again afterward to hide them
again if you prefer. (Windows Explorer shows these folders normally — no
extra step needed there.)

On the empty repository page, GitHub shows a line that says something like
*"…or create a new repository on the command line"* — ignore that, and
instead look for **"uploading an existing file"** (a small link on that same
page) and click it. This opens a drag-and-drop upload screen.

Open the `sustenance-app` folder on your computer, **select everything
inside it** (not the folder itself — go inside it first, then select all:
`index.html`, `package.json`, `vite.config.js`, `README.md`, `.gitignore`,
the `src` folder, and the `.github` folder), and drag that whole selection
into the browser upload area.

> Modern browsers support dragging folders (like `src` and `.github`) along
> with their contents, and GitHub's uploader preserves that folder structure.
> If a folder doesn't seem to upload properly, try Chrome or Edge — they
> tend to handle this most reliably.

Scroll down, and click **Commit changes** (the green button) to finish the
upload.

## Step 4: Turn on GitHub Pages with Actions as the source

1. On your repository page, click **Settings**
2. Click **Pages** in the left sidebar
3. Under "Build and deployment" → "Source," choose **GitHub Actions**
   (not "Deploy from a branch" — that's for Option B)

That's it for setup. Because the project includes a file at
`.github/workflows/deploy.yml`, GitHub automatically noticed it during your
upload in Step 3 and will build the site for you on GitHub's own servers.

## Step 5: Watch it build, then visit your site

1. Click the **Actions** tab on your repository
2. You should see a workflow run in progress (a yellow dot), or already
   finished (a green checkmark). It usually takes 1–2 minutes.
3. Once it's green, go back to **Settings → Pages** — you'll see your live
   URL at the top, looking like:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## Making updates later (still no terminal)

1. Make changes to your files locally
2. Go to your repository on GitHub, navigate into the folder containing the
   changed file, click on it, click the pencil (✏️) icon to edit directly
   in the browser — or delete and re-upload it via "Add file" → "Upload files"
3. Commit the change

Every commit to the `main` branch automatically re-triggers the Actions
workflow and updates your live site within a minute or two. You can watch
it happen on the **Actions** tab.

---

# Option B: Using the terminal

If you'd rather use Git/npm directly (useful if you're comfortable with a
terminal and want faster, more standard workflows for future updates):

## Step 1: Confirm Git and Node are installed

```bash
git --version
node --version
```

If either command isn't found: install Git from
[git-scm.com](https://git-scm.com/downloads) and Node.js (LTS version) from
[nodejs.org](https://nodejs.org), then reopen your terminal and check again.

## Step 2: One-time Git identity setup (skip if already done before)

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## Step 3: Open a terminal inside the unzipped `sustenance-app` folder

Confirm you're in the right place:

```bash
ls
```

You should see `package.json`, `src`, `.github`, etc.

## Step 4: Create an empty repository on GitHub

Same as Option A, Step 2 above — create it empty, no README.

## Step 5: Push your code

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace the URL with your actual repository URL. If prompted, log in via
the browser window that pops up.

## Step 6: Turn on GitHub Pages with Actions as the source

Same as Option A, Step 4 — Settings → Pages → Source → **GitHub Actions**.
Since `.github/workflows/deploy.yml` is already part of the pushed code,
it'll build and deploy automatically, same as Option A from here.

## Making updates later

```bash
git add .
git commit -m "Describe what you changed"
git push
```

That's it — no need to run `npm run build` or `npm run deploy` yourself;
the GitHub Actions workflow handles the build on every push.

---

## If something goes wrong

- **Actions tab shows a red ✕ (failed build):** click into the failed run
  to see the error log. The most common cause is a missing or misnamed file
  from the upload — double check `package.json` and the `src` folder made
  it into the repository correctly.
- **Site loads but looks broken/unstyled:** usually means the build didn't
  fully complete — check the Actions tab for errors before troubleshooting
  further.
- **Can't find "uploading an existing file" link:** it only appears on a
  brand new, completely empty repository. If you accidentally initialized
  it with a README, delete the repo and create a fresh empty one.
