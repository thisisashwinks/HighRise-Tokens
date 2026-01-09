# Publishing Figma Plugin for HighLevel Company Members

This guide will help you publish the "Apply Component Tokens" plugin privately to HighLevel company members (not public community).

## Prerequisites

1. **Figma Account**: You need a Figma account with admin/owner permissions in the HighLevel organization
2. **Plugin Built**: The plugin must be built (`npm run build` should generate `code.js`)
3. **Plugin Tested**: Ensure the plugin works correctly in your Figma files

## Step-by-Step Publishing Process

### Step 1: Prepare Plugin Files

Ensure you have these files ready:
- `manifest.json` - Plugin configuration
- `code.js` - Compiled plugin code (from `npm run build`)
- `ui.html` - Plugin UI interface

### Step 2: Open Plugin Development Mode

1. Open Figma Desktop App (plugins must be published from desktop, not web)
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select your `manifest.json` file
4. The plugin should appear in your development plugins list

### Step 3: Test the Plugin

1. Before publishing, test the plugin thoroughly:
   - Open a test Figma file
   - Run the plugin from **Plugins** → **Development** → **Apply Component Tokens**
   - Verify all functionality works as expected

### Step 4: Publish Plugin (Private to HighLevel)

1. In Figma Desktop App, go to **Plugins** → **Development**
2. Find your "Apply Component Tokens" plugin
3. Click the **"..."** menu next to your plugin
4. Select **"Publish plugin"** or **"Submit for review"**

### Step 5: Enable Two-Factor Authentication (REQUIRED)

**IMPORTANT**: Before publishing, you must enable two-factor authentication:
1. Go to your Figma account settings
2. Navigate to **Security** settings
3. Enable **Two-Factor Authentication**
4. Complete the setup process
5. Return to the publishing dialog

### Step 6: Configure Publishing Settings

When the publishing dialog opens:

1. **Plugin Name**: "Apply Component Tokens" (or your preferred name)
2. **Description**: 
   ```
   Automatically apply design tokens (colors, typography, spacing, shadows) to Figma components based on component properties (variant, size, state, theme). Supports buttons, inputs, and other components with automatic token mapping.
   ```
3. **Category**: Select "Design" or "Productivity"
4. **Author (Share as)**: 
   - Select **"HighLevel LLC"** (your Organization)
   - This determines who the plugin is attributed to
5. **Publish to**: 
   - **CRITICAL**: Look for **"HighLevel LLC"** option in the "Publish to" section
   - This is different from "Author (Share as)" - it controls who can access the plugin
   - **If "HighLevel LLC" doesn't appear in "Publish to"**, it means:
     - Your organization may not be on Organization or Enterprise plan
     - Organization admin may need to enable plugin publishing permissions
     - You may not have the required permissions
   - **If only "Community" appears**, see "Troubleshooting" section below
6. **Support contact**: Enter your email (e.g., ashwin.ks@gohighlevel.com)
7. **Icon**: Upload a plugin icon (optional but recommended)
   - Size: 128x128px or 256x256px
   - Format: PNG or SVG

### Step 7: Submit for Review

1. Review all plugin details
2. Ensure **"Author (Share as)"** is set to your Team (not individual)
3. Ensure visibility is set to **"Only people in your organization"** (should appear after selecting Team)
4. If you still only see "Community" option:
   - Verify you selected your Team in "Author (Share as)"
   - Check if your team has organization-level permissions
   - You may need to contact Figma support or your organization admin
5. Click **"Publish"**

### Step 8: Approval Process

- If your organization requires approval, an admin will need to approve the plugin
- Once approved, the plugin will be available to all HighLevel organization members
- They can find it under **Plugins** → **Browse plugins in development** → **Organization plugins**

## Post-Publishing

### Making Plugin Available to Team

After publishing:

1. **Team Access**: The plugin will automatically be available to all HighLevel organization members
2. **Usage**: Team members can access it via:
   - **Plugins** → **Browse plugins in development** → **Organization plugins**
   - Or search for "Apply Component Tokens" in the plugin browser

### Updating the Plugin

To update the plugin after publishing:

1. Make your changes to `code.ts`
2. Run `npm run build` to compile
3. In Figma Desktop: **Plugins** → **Development** → Find your plugin
4. Click **"..."** → **"Update plugin"**
5. Select the updated `manifest.json` and `code.js`
6. Submit the update (it will be versioned automatically)

## Troubleshooting

### "HighLevel LLC" Option Not Appearing in "Publish to" Section

**This is the key issue!** The organization option in "Publish to" requires specific conditions:

**Requirements for Organization-Only Publishing:**
1. ✅ **Figma Organization or Enterprise Plan**: HighLevel LLC must be on Organization or Enterprise subscription (not Starter/Professional)
2. ✅ **Two-Factor Authentication**: Must be enabled (required for all publishing)
3. ✅ **Organization Admin Permissions**: You may need admin permissions, or admin must enable plugin publishing
4. ✅ **Plugin Publishing Enabled**: Organization admin must enable plugin publishing in Organization Settings

**How to Check/Enable:**

1. **Verify Organization Plan**:
   - Ask your HighLevel LLC organization admin to check the subscription tier
   - Go to **Organization Settings** → **Billing** to see plan type
   - Organization-only plugins require **Organization** or **Enterprise** plan

2. **Check Organization Settings**:
   - Organization admin should go to **Organization Settings** → **Plugins**
   - Look for "Allow organization members to publish plugins" or similar setting
   - Enable it if it's disabled

3. **Verify Your Permissions**:
   - You need to be an **Organization Admin** or have plugin publishing permissions
   - Contact your HighLevel LLC organization admin to grant permissions

4. **Contact Figma Support** (if above doesn't work):
   - If HighLevel LLC is on Organization/Enterprise plan and settings are correct
   - Contact Figma Support to verify organization plugin publishing is enabled
   - They can check account settings and enable if needed

**If Organization Option Still Doesn't Appear:**
- Use **Manual Distribution** (see Alternative Solutions below) - this is the most reliable method
- Or publish to Community but only share the link internally with HighLevel LLC members

### Plugin Not Appearing for Team Members

- Ensure plugin visibility is set to "Only people in your organization"
- Verify team members are part of the HighLevel organization
- Check if organization admin approval is required

### Publishing Errors

- Ensure `code.js` is compiled and up-to-date (`npm run build`)
- Check that `manifest.json` is valid JSON
- Verify all required files (manifest.json, code.js, ui.html) are present
- Try republishing from Figma Desktop App (not web)
- **Enable Two-Factor Authentication** (required for publishing)

### Permission Issues

- You need admin/owner permissions in the HighLevel organization
- Contact your Figma organization admin if you don't have publishing permissions
- Your team may need organization-level plugin publishing enabled

## Alternative Solutions: Sharing with HighLevel LLC Only

Since Figma's plugin publishing dialog may not show organization-only options, here are reliable alternatives:

### Option 1: Manual Distribution (Recommended)

**Most reliable way to share with only HighLevel LLC members:**

1. **Package the Plugin**:
   - Create a ZIP file containing:
     - `manifest.json`
     - `code.js` (compiled)
     - `ui.html`
   - Or share the entire `figma-plugin-apply-tokens` folder

2. **Share via Internal Channel**:
   - Share the plugin files via HighLevel's internal file sharing (Google Drive, Dropbox, Slack, etc.)
   - Only share with HighLevel LLC team members

3. **Team Members Import**:
   - Each team member opens Figma Desktop App
   - Goes to **Plugins** → **Development** → **Import plugin from manifest...**
   - Selects the `manifest.json` file
   - Plugin appears in their development plugins list

**Advantages:**
- ✅ Only HighLevel LLC members who receive the files can use it
- ✅ No public exposure
- ✅ Works immediately, no approval process
- ✅ Full control over distribution

### Option 2: Publish to Community with Clear Naming

If you must use Figma's publishing system:

1. **Publish as "HighLevel LLC"** in "Author (Share as)"
2. **Name it clearly**: "HighLevel - Apply Component Tokens" (indicates internal use)
3. **In Description**, add: "Internal tool for HighLevel LLC team members only"
4. **Share the plugin link** only with HighLevel LLC members via internal channels
5. Team members can install it directly from the link

**Note**: This still makes it publicly discoverable, but if you only share the link internally, it's effectively private.

### Option 3: Contact Figma Support

If organization-only publishing is critical:

1. Contact Figma Support about organization-only plugin publishing
2. Ask if this feature is available for your subscription tier
3. Request that they enable it for HighLevel LLC organization
4. They may provide a special publishing workflow for organizations

## Notes

- **Private plugins** are only visible to your organization members
- **Public plugins** are visible to everyone in the Figma community
- For HighLevel internal use, always choose **"Only people in your organization"**
- Plugin updates require re-publishing (versioning is automatic)
- **Two-Factor Authentication is REQUIRED** before publishing
- **Must publish as Team/Organization** (not individual) to get organization-only option
- If "Only people in your organization" doesn't appear, check:
  1. 2FA is enabled ✅
  2. You selected Team (not individual) in "Author (Share as)" ✅
  3. Your team has organization permissions ✅

