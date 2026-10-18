import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashOpaqueToken, recordAuditLog } from '@/lib/account-admission';

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email || 'wlfjck@gmail.com';

  const currentUser =
    (await prisma.user.findUnique({ where: { email: sessionEmail } })) ||
    (await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }));

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      groups: { orderBy: { createdAt: 'asc' } },
      folders: { orderBy: { createdAt: 'asc' } },
      themes: { orderBy: { createdAt: 'asc' } },
      customFonts: { orderBy: { createdAt: 'desc' } },
      iconLibraries: { orderBy: { createdAt: 'asc' } },
      templates: { orderBy: { usageCount: 'desc' } },
      aiImages: { orderBy: { createdAt: 'desc' } },
      sites: {
        orderBy: { publishedAt: 'desc' },
        include: { doc: { select: { id: true, title: true, slug: true } } },
      },
      apiKeys: { orderBy: { createdAt: 'desc' } },
      mcpConnectors: { orderBy: { createdAt: 'asc' } },
      agentChats: { orderBy: { updatedAt: 'desc' } },
    },
  });

  const docs = await prisma.doc.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      folder: true,
      owner: { select: { id: true, name: true, email: true } },
      cards: { orderBy: { orderIndex: 'asc' } },
    },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { memberships: true },
  });

  const invitations = await prisma.accountInvitation.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    ok: true,
    currentUser: currentUser
      ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          status: currentUser.status,
          credits: currentUser.credits,
          gamma5Mode: currentUser.gamma5Mode,
          customInstructions: currentUser.customInstructions,
        }
      : null,
    workspace,
    docs,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      revokedAt: u.revokedAt,
      isGuest: u.memberships[0]?.isGuest ?? false,
      groupName: u.memberships[0]?.groupName ?? 'General',
      createdAt: u.createdAt,
    })),
    invitations,
    auditLogs,
  });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!ws) {
      return NextResponse.json({ ok: false, message: 'Workspace not found.' }, { status: 404 });
    }

    // 1. Create Folder
    if (body.action === 'create_folder') {
      const slug = `${(body.name || 'new-folder')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      const folder = await prisma.folder.create({
        data: {
          workspaceId: ws.id,
          name: body.name || 'Untitled Folder',
          slug,
          description: body.description || 'Team collaborative folder',
          color: body.color || '#4f46e5',
          isPinned: Boolean(body.isPinned),
          ownerId: body.ownerId || '5312nslecjum8si',
        },
      });
      return NextResponse.json({ ok: true, folder });
    }

    // 2. Toggle Folder Pin or Share Permissions
    if (body.action === 'update_folder' && body.folderId) {
      const folder = await prisma.folder.update({
        where: { id: body.folderId },
        data: {
          ...(body.isPinned !== undefined ? { isPinned: Boolean(body.isPinned) } : {}),
          ...(body.accessLevel ? { accessLevel: body.accessLevel } : {}),
          ...(body.ownerId ? { ownerId: body.ownerId } : {}),
          ...(body.permissionsJson ? { permissionsJson: JSON.stringify(body.permissionsJson) } : {}),
        },
      });
      return NextResponse.json({ ok: true, folder });
    }

    // 3. Upload Custom Font
    if (body.action === 'upload_font') {
      const font = await prisma.customFont.create({
        data: {
          workspaceId: ws.id,
          familyName: body.familyName || 'Custom Corporate Sans',
          weightsJson: JSON.stringify(body.weights || ['400 Regular', '700 Bold']),
          format: body.format || 'WOFF2',
          fileSizeKb: Number(body.fileSizeKb) || 142,
          uploadedBy: body.uploadedBy || 'Jack Wolf',
          licenseVerified: true,
        },
      });
      return NextResponse.json({ ok: true, font });
    }

    // 4. Create Icon Library
    if (body.action === 'create_icon_library') {
      const slug = `${(body.name || 'custom-icons')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      const iconLibrary = await prisma.iconLibrary.create({
        data: {
          workspaceId: ws.id,
          name: body.name || 'Custom Brand Icons',
          slug,
          style: body.style || 'Duotone',
          iconCount: Number(body.iconCount) || 36,
        },
      });
      return NextResponse.json({ ok: true, iconLibrary });
    }

    // 5. Create or Update Theme
    if (body.action === 'create_theme') {
      const slug = `${(body.name || 'custom-theme')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      const theme = await prisma.theme.create({
        data: {
          workspaceId: ws.id,
          name: body.name || 'Custom Theme',
          slug,
          category: 'CUSTOM',
          primaryColor: body.primaryColor || '#4f46e5',
          secondaryColor: body.secondaryColor || '#7c3aed',
          accentColor: body.accentColor || '#06b6d4',
          backgroundColor: body.backgroundColor || '#0f172a',
          surfaceColor: body.surfaceColor || '#1e293b',
          textColor: body.textColor || '#f8fafc',
          headingFont: body.headingFont || 'Plus Jakarta Sans',
          bodyFont: body.bodyFont || 'Inter',
          gradientCss:
            body.gradientCss ||
            `linear-gradient(135deg, ${body.backgroundColor || '#0f172a'} 0%, ${
              body.primaryColor || '#4f46e5'
            } 100%)`,
          customCss: body.customCss || '',
        },
      });
      return NextResponse.json({ ok: true, theme });
    }

    // 6. Create API Key
    if (body.action === 'create_api_key') {
      const rawKey = `sk-gamma-live-${Math.random().toString(36).slice(2, 10)}${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      const apiKey = await prisma.apiKey.create({
        data: {
          workspaceId: ws.id,
          name: body.name || 'Automation API Key',
          keyPrefix: `${rawKey.slice(0, 16)}...${rawKey.slice(-4)}`,
          keyHash: hashOpaqueToken(rawKey),
          scopes: body.scopes || 'docs:read,docs:write,generate:run,templates:use',
          lastUsedAt: new Date(),
        },
      });
      await recordAuditLog({
        action: 'API_KEY_CREATED',
        actorEmail: 'wlfjck@gmail.com',
        targetType: 'ApiKey',
        targetId: apiKey.id,
        metadata: { name: apiKey.name, keyPrefix: apiKey.keyPrefix },
      });
      return NextResponse.json({ ok: true, apiKey, rawKey });
    }

    // 7. Revoke API Key
    if (body.action === 'revoke_api_key' && body.keyId) {
      const apiKey = await prisma.apiKey.update({
        where: { id: body.keyId },
        data: { revokedAt: new Date() },
      });
      return NextResponse.json({ ok: true, apiKey });
    }

    // 8. Toggle MCP Connector
    if (body.action === 'toggle_connector' && body.connectorId) {
      const existing = await prisma.mcpConnector.findUnique({
        where: { id: body.connectorId },
      });
      if (existing) {
        const updated = await prisma.mcpConnector.update({
          where: { id: body.connectorId },
          data: {
            status: existing.status === 'connected' ? 'available' : 'connected',
          },
        });
        return NextResponse.json({ ok: true, connector: updated });
      }
    }

    // 9. Add Custom MCP Connector
    if (body.action === 'create_mcp_connector') {
      const connector = await prisma.mcpConnector.create({
        data: {
          workspaceId: ws.id,
          name: body.name || 'Custom MCP Server',
          provider: 'custom_mcp',
          category: 'custom_mcp',
          status: 'connected',
          endpointUrl: body.endpointUrl || 'https://mcp.example.com/sse',
          description: body.description || 'Custom Model Context Protocol server integration.',
          icon: 'cpu',
        },
      });
      return NextResponse.json({ ok: true, connector });
    }

    // 10. Publish / Convert Doc to Site
    if (body.action === 'publish_site' && body.docId) {
      const doc = await prisma.doc.findUnique({ where: { id: body.docId } });
      const subdomain =
        body.subdomain ||
        `${(doc?.slug || 'gamma-site').slice(0, 24)}-${Date.now().toString(36).slice(-4)}`;
      const site = await prisma.site.create({
        data: {
          workspaceId: ws.id,
          docId: body.docId,
          name: body.name || doc?.title || 'Published Gamma Site',
          subdomain,
          customDomain: body.customDomain || `${subdomain}.genesisiq.ai`,
          status: 'ACTIVE',
          seoTitle: doc?.title,
        },
      });
      return NextResponse.json({ ok: true, site });
    }

    // 11. Generate AI Image
    if (body.action === 'generate_ai_image') {
      const palettes = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      ];
      const image = await prisma.aiImage.create({
        data: {
          workspaceId: ws.id,
          prompt: body.prompt || 'Futuristic 3D glassmorphic AI architecture',
          model: body.model || 'Flux Fast 1.1',
          style: body.style || '3D Glassmorphism',
          aspectRatio: body.aspectRatio || '16:9',
          source: body.source || 'AI_GENERATED',
          imageUrl: palettes[Math.floor(Math.random() * palettes.length)],
          creatorName: 'Jack Wolf',
          creditsCost: 10,
        },
      });
      return NextResponse.json({ ok: true, image });
    }

    // 12. Claim Ownerless Doc
    if (body.action === 'claim_ownerless_doc' && body.docId) {
      const doc = await prisma.doc.update({
        where: { id: body.docId },
        data: { ownerId: body.ownerId || '5312nslecjum8si' },
      });
      return NextResponse.json({ ok: true, doc });
    }

    // 13. Restore Archived Template
    if (body.action === 'toggle_template_archive' && body.templateId) {
      const tpl = await prisma.template.findUnique({ where: { id: body.templateId } });
      if (tpl) {
        const updated = await prisma.template.update({
          where: { id: tpl.id },
          data: { isArchived: !tpl.isArchived },
        });
        return NextResponse.json({ ok: true, template: updated });
      }
    }

    // 14. Update general Workspace Settings
    const updatedWs = await prisma.workspace.update({
      where: { id: ws.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.defaultThemeId ? { defaultThemeId: body.defaultThemeId } : {}),
        ...(body.defaultIconLibraryId ? { defaultIconLibraryId: body.defaultIconLibraryId } : {}),
        ...(body.workspacePermission ? { workspacePermission: body.workspacePermission } : {}),
        ...(body.accessLinkPermission ? { accessLinkPermission: body.accessLinkPermission } : {}),
        ...(body.requireSso !== undefined ? { requireSso: Boolean(body.requireSso) } : {}),
        ...(body.ssoDomain ? { ssoDomain: body.ssoDomain } : {}),
        ...(body.ssoProvider ? { ssoProvider: body.ssoProvider } : {}),
        ...(body.customInstructions !== undefined
          ? { customInstructions: body.customInstructions }
          : {}),
      },
    });

    return NextResponse.json({ ok: true, workspace: updatedWs });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Workspace update failed.',
      },
      { status: 500 }
    );
  }
}
