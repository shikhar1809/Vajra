import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Add new project to workspace
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workspaceId, name, repositoryUrl, description } = body;

        if (!workspaceId || !name) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID and name are required' },
                { status: 400 }
            );
        }

        // Insert project
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                workspace_id: workspaceId,
                name,
                repository_url: repositoryUrl,
                description,
                status: 'active',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

// GET - Get all projects for workspace
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

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { projects: projects || [] },
        });
    } catch (error) {
        console.error('Projects GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
