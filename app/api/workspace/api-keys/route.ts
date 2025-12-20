import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate API key
function generateApiKey(): string {
    return 'vjs_' + randomBytes(32).toString('hex');
}

// POST - Create new API key
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workspaceId, name, userId } = body;

        if (!workspaceId || !name) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and name are required' },
                { status: 400 }
            );
        }

        const apiKey = generateApiKey();

        // Store API key in database
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                workspace_id: workspaceId,
                key: apiKey,
                name,
                created_by: userId,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating API key:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                key: apiKey, // Only returned once!
                name: data.name,
                created_at: data.created_at,
            },
        });
    } catch (error) {
        console.error('API key creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create API key' },
            { status: 500 }
        );
    }
}

// GET - List API keys for workspace (without showing actual keys)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        const { data: keys, error } = await supabase
            .from('api_keys')
            .select('id, name, created_at, last_used_at, is_active')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { keys: keys || [] },
        });
    } catch (error) {
        console.error('API keys GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

// DELETE - Revoke API key
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const keyId = searchParams.get('keyId');

        if (!keyId) {
            return NextResponse.json(
                { success: false, error: 'Key ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId);

        if (error) {
            console.error('Error revoking API key:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'API key revoked successfully',
        });
    } catch (error) {
        console.error('API key revocation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to revoke API key' },
            { status: 500 }
        );
    }
}
