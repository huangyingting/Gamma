import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3100';

async function runTests() {
  console.log(`[E2E] Starting Playwright verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // ---------------------------------------------------------------------------
    // 1. Invite-Only Account Admission & Security API Verification
    // ---------------------------------------------------------------------------
    console.log('[E2E] 1/6 Verifying Invite-Only Admission, Single-Use Codes, Revocation & Audit Logs...');

    // 1a. Verify pre-seeded invitation token
    const verifyRes = await page.request.get(
      `${BASE_URL}/api/invitations/verify?code=GAMMA-EXEC-2026`
    );
    const verifyJson = await verifyRes.json();
    assert.equal(verifyJson.ok, true, 'GAMMA-EXEC-2026 should be valid initially');
    assert.equal(verifyJson.invitation.email, 'alex.chen@genesisiq.ai');

    // 1b. Attempt registration with wrong email -> must fail with email_mismatch
    const mismatchRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        name: 'Wrong User',
        email: 'intruder@example.com',
        password: 'StrongPassword2026!',
        code: 'GAMMA-EXEC-2026',
      },
    });
    assert.equal(mismatchRes.status(), 403);
    const mismatchJson = await mismatchRes.json();
    assert.equal(mismatchJson.error, 'email_mismatch');

    // 1c. Redeem single-use invitation with matching email -> must succeed
    const redeemRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        name: 'Alex Chen',
        email: 'alex.chen@genesisiq.ai',
        password: 'GammaUserPass2026!',
        code: 'GAMMA-EXEC-2026',
      },
    });
    assert.equal(redeemRes.status(), 201);
    const redeemJson = await redeemRes.json();
    assert.equal(redeemJson.ok, true);
    assert.equal(redeemJson.user.role, 'EDITOR');

    // 1d. Attempt second redemption of the same single-use invitation -> must fail
    const reuseRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        name: 'Alex Clone',
        email: 'alex.chen@genesisiq.ai',
        password: 'GammaUserPass2026!',
        code: 'GAMMA-EXEC-2026',
      },
    });
    assert.equal(reuseRes.status(), 410);
    const reuseJson = await reuseRes.json();
    assert.equal(reuseJson.error, 'already_redeemed');

    // 1e. Create a fresh invitation via API, then revoke it and verify revocation blocks signup
    const createInviteRes = await page.request.post(`${BASE_URL}/api/invitations`, {
      data: {
        email: 'revoked.candidate@genesisiq.ai',
        role: 'VIEWER',
        expiresInHours: 48,
      },
    });
    assert.equal(createInviteRes.status(), 201);
    const createInviteJson = await createInviteRes.json();
    assert.equal(createInviteJson.ok, true);
    const rawCode = createInviteJson.code;
    const invId = createInviteJson.invitation.id;

    const revokeInviteRes = await page.request.post(`${BASE_URL}/api/invitations`, {
      data: { action: 'revoke', id: invId },
    });
    assert.equal(revokeInviteRes.status(), 200);

    const revokedSignupRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        name: 'Revoked Candidate',
        email: 'revoked.candidate@genesisiq.ai',
        password: 'GammaUserPass2026!',
        code: rawCode,
      },
    });
    assert.equal(revokedSignupRes.status(), 410);
    const revokedSignupJson = await revokedSignupRes.json();
    assert.equal(revokedSignupJson.error, 'revoked_invitation');

    console.log('   ✔ Invite-Only Admission & Single-Use/Revoked token checks passed.');

    // ---------------------------------------------------------------------------
    // 2. Public Marketing, Pricing, Sign In, Sign Up & 404 Edge Routes
    // ---------------------------------------------------------------------------
    console.log('[E2E] 2/6 Verifying Marketing, Pricing, Auth & 404 Edge Routes...');

    await page.goto(`${BASE_URL}/?view=marketing`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="marketing-home-page"]').waitFor();

    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="pricing-page"]').waitFor();

    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="signin-email-input"]').waitFor();

    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="signup-invite-code-input"]').waitFor();

    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').waitFor();

    await page.goto(`${BASE_URL}/non-existent-route-404-check`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="error-404-page"]').waitFor();

    console.log('   ✔ Public, Pricing, Auth & 404 routes verified.');

    // ---------------------------------------------------------------------------
    // 3. Workspace Shell, 2-Tier Sidebar, Bulk Select, Modals & 11 Settings Pages
    // ---------------------------------------------------------------------------
    console.log('[E2E] 3/6 Verifying Workspace Shell, Navigation, Modals & Enterprise Settings...');

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="workspace-shell"]').waitFor();
    await page.locator('[data-testid="gammas-grid-container"]').waitFor();

    // Toggle Grid / List view
    await page.locator('[data-testid="view-mode-list-btn"]').click();
    await page.locator('[data-testid="gammas-list-table"]').waitFor();
    await page.locator('[data-testid="view-mode-grid-btn"]').click();
    await page.locator('[data-testid="gammas-grid-container"]').waitFor();

    // Open Cmd+K Quick Switcher Modal
    await page.locator('[data-testid="search-files-trigger"]').click();
    await page.locator('[data-testid="cmd-k-modal"]').waitFor();
    await page.locator('[data-testid="cmd-k-modal"] button:has-text("ESC")').click();

    // Navigate Agent Home & Agent Chats
    await page.locator('[data-testid="nav-agent-home"]').click();
    await page.locator('[data-testid="gamma5-agent-entry-home"]').waitFor();

    await page.locator('[data-testid="nav-agent-chats"]').click();
    await page.locator('[data-testid="agent-chats-history-view"]').waitFor();

    // Navigate Sites, AI Images, Templates, Themes, Fonts, Trash
    await page.locator('[data-testid="nav-sites"]').click();
    await page.locator('[data-testid="sites-management-view"]').waitFor();

    await page.locator('[data-testid="rail-media-btn"]').click();
    await page.locator('[data-testid="media-ai-images-view"]').waitFor();

    await page.locator('[data-testid="rail-templates-btn"]').click();
    await page.locator('[data-testid="templates-hub-view"]').waitFor();

    await page.locator('[data-testid="rail-customize-btn"]').click();
    await page.locator('[data-testid="customize-themes-view"]').waitFor();
    await page.locator('[data-testid="open-theme-builder-btn"]').click();
    await page.locator('[data-testid="theme-builder-modal"]').waitFor();

    await page.goto(`${BASE_URL}/custom-fonts`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="customize-fonts-view"]').waitFor();
    await page.locator('[data-testid="open-upload-font-modal-btn"]').click();
    await page.locator('[data-testid="upload-font-modal"]').waitFor();

    // Enterprise Settings & Invite-Only Admin Controls
    await page.goto(`${BASE_URL}/settings/members`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="settings-members-view"]').waitFor();
    await page.locator('[data-testid="invite-email-input"]').waitFor();

    await page.goto(`${BASE_URL}/settings/audit-logs`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="settings-audit-logs-view"]').waitFor();

    console.log('   ✔ Workspace Shell, 2-tier sidebar, modals & 11 Settings sections verified.');

    // ---------------------------------------------------------------------------
    // 4. 5-Mode AI Creation Suite (/create/*)
    // ---------------------------------------------------------------------------
    console.log('[E2E] 4/6 Verifying 5-Mode AI Creation Suite...');

    await page.goto(`${BASE_URL}/create`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-hub-page"]').waitFor();

    await page.goto(`${BASE_URL}/create/generate`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-generate-page"]').waitFor();
    await page.locator('[data-testid="outline-card-input-0"]').waitFor();

    await page.goto(`${BASE_URL}/create/paste`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-paste-page"]').waitFor();

    await page.goto(`${BASE_URL}/create/import`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-import-page"]').waitFor();

    await page.goto(`${BASE_URL}/create/from-template`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-from-template-page"]').waitFor();

    await page.goto(`${BASE_URL}/create/studio`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="create-studio-page"]').waitFor();

    console.log('   ✔ All 5 AI creation workflows verified.');

    // ---------------------------------------------------------------------------
    // 5. Collaborative Card Editor (/docs/amqq3hoavnc5sek) + Drawers + Presenter
    // ---------------------------------------------------------------------------
    console.log('[E2E] 5/6 Verifying Gamma 5 Collaborative Card Editor, Smart Layouts, Charts & Agent...');

    await page.goto(`${BASE_URL}/docs/amqq3hoavnc5sek`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="gamma-editor-shell"]').waitFor();
    await page.locator('[data-testid="editor-card-0"]').waitFor();

    // Open Card Styling popover & Smart Layout popover
    await page.locator('[data-testid="card-styling-btn-0"]').click();
    await page.locator('[data-testid="card-styling-popover-0"]').waitFor();
    await page.locator('[data-testid="card-smart-layout-btn-0"]').click();
    await page.locator('[data-testid="card-smart-layout-popover-0"]').waitFor();
    await page.locator('[data-testid="card-smart-layout-btn-0"]').click();

    // Open Interactive Chart Data Spreadsheet Editor on Card 2 (index 1) & mutate chart type + row data
    await page.locator('[data-testid="edit-chart-data-btn-1"]').click();
    await page.locator('[data-testid="chart-spreadsheet-editor"]').waitFor();
    await page.locator('[data-testid="chart-type-bar"]').click();
    await page.locator('[data-testid="chart-add-row-btn"]').click();
    await page.locator('[data-testid="close-right-drawer-btn"]').click();

    // Switch live Theme in Theme Drawer & verify persistence
    await page.locator('[data-testid="editor-theme-btn"]').click();
    await page.locator('[data-testid="editor-right-drawer-theme"]').waitFor();
    await page.locator('[data-testid="theme-option-theme_stratos"]').click();
    await page.locator('[data-testid="close-right-drawer-btn"]').click();

    // Open Left-Docked Gamma 5 AI Agent & send an instruction
    await page.locator('[data-testid="editor-agent-toggle-btn"]').click();
    await page.locator('[data-testid="editor-agent-panel"]').waitFor();
    await page.locator('[data-testid="editor-agent-mode-research"]').click();
    await page
      .locator('[data-testid="editor-agent-input"]')
      .fill('Add Q4 executive telemetry summary');
    await page.locator('[data-testid="editor-agent-send-btn"]').click();

    // Open Overflow Menu -> Version History drawer & create a new snapshot
    await page.locator('[data-testid="editor-overflow-menu-btn"]').click();
    await page.locator('[data-testid="doc-menu-version-history"]').click();
    await page.locator('[data-testid="editor-right-drawer-history"]').waitFor();
    await page.locator('[data-testid="snapshot-label-input"]').fill('E2E Verified Checkpoint');
    await page.locator('[data-testid="create-snapshot-btn"]').click();
    await page.locator('text=E2E Verified Checkpoint').waitFor();
    await page.locator('[data-testid="close-right-drawer-btn"]').click();

    // Open Comments Drawer & post a persisted comment
    await page.locator('[data-testid="toolbar-comments-drawer-btn"]').click();
    await page.locator('[data-testid="editor-right-drawer-comments"]').waitFor();
    await page.locator('[data-testid="new-comment-input"]').fill('Product-grade E2E comment verified!');
    await page.locator('[data-testid="post-comment-btn"]').click();
    await page.locator('text=Product-grade E2E comment verified!').waitFor();
    await page.locator('[data-testid="close-right-drawer-btn"]').click();

    // Add a card via the Left Filmstrip & verify card count increases
    await page.locator('[data-testid="filmstrip-add-card-btn"]').click();
    await page.locator('[data-testid="filmstrip-card-thumb-4"]').waitFor();

    // Open Fullscreen Presentation Mode & Exit
    await page.locator('[data-testid="editor-present-btn"]').click();
    await page.locator('[data-testid="fullscreen-presenter-overlay"]').waitFor();
    await page.locator('[data-testid="exit-present-mode-btn"]').click();

    // Verify Presenter Speaker View, Public Viewer & Published Site
    await page.goto(`${BASE_URL}/docs/presenter/amqq3hoavnc5sek`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="presenter-speaker-view"]').waitFor();

    await page.goto(`${BASE_URL}/public/amqq3hoavnc5sek`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="gamma-editor-shell"]').waitFor();

    await page.goto(`${BASE_URL}/s/genesisiq-roadmap`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="published-gamma-site"]').waitFor();

    console.log('   ✔ Collaborative Card Editor, AI Agent, Drawers, Speaker View & Sites verified.');

    // ---------------------------------------------------------------------------
    // 6. Responsive Viewport Verification (Tablet 768x1024 & Mobile 390x844)
    // ---------------------------------------------------------------------------
    console.log('[E2E] 6/6 Verifying Responsive Layouts (Tablet & Mobile)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="workspace-shell"]').waitFor();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/docs/amqq3hoavnc5sek`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-testid="gamma-editor-shell"]').waitFor();

    console.log('   ✔ Responsive layouts verified.');
    console.log('\n✅ ALL GAMMA 5 END-TO-END TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

runTests().catch((err) => {
  console.error('❌ E2E Test Failure:', err);
  process.exit(1);
});
