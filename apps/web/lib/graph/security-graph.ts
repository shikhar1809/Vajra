/**
 * Vajra - Security Graph
 * 
 * Unified knowledge graph connecting all security telemetry
 * Inspired by CrowdStrike's Threat Graph and Wiz's Security Graph
 * 
 * Features:
 * - Entity tracking (users, IPs, assets, vulnerabilities)
 * - Relationship mapping
 * - Attack path analysis
 * - Cross-module correlation
 */

import crypto from 'crypto';

// Entity Types
export type EntityType =
    | 'ip'
    | 'user'
    | 'device'
    | 'vendor'
    | 'employee'
    | 'asset'
    | 'vulnerability'
    | 'threat'
    | 'code_file'
    | 'api_endpoint'
    | 'domain';

// Relationship Types
export type RelationType =
    | 'accessed'
    | 'depends_on'
    | 'communicates_with'
    | 'has_vulnerability'
    | 'exploits'
    | 'owns'
    | 'manages'
    | 'triggered'
    | 'blocked'
    | 'similar_to';

export interface Entity {
    id: string;
    type: EntityType;
    name: string;
    properties: Record<string, any>;
    riskScore: number;
    firstSeen: Date;
    lastSeen: Date;
    tags: string[];
}

export interface Relationship {
    id: string;
    sourceId: string;
    targetId: string;
    type: RelationType;
    properties: Record<string, any>;
    weight: number;
    createdAt: Date;
}

export interface AttackPath {
    id: string;
    steps: Array<{
        entity: Entity;
        relationship: Relationship;
        action: string;
        riskContribution: number;
    }>;
    totalRisk: number;
    description: string;
    mitigations: string[];
}

export interface ToxicCombination {
    entities: Entity[];
    risk: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * In-Memory Security Graph
 * In production, use Neo4j or similar graph database
 */
export class SecurityGraph {
    private entities = new Map<string, Entity>();
    private relationships = new Map<string, Relationship>();
    private entityIndex = new Map<EntityType, Set<string>>();
    private relationshipIndex = new Map<string, Set<string>>();

    constructor() {
        // Initialize entity type indexes
        const entityTypes: EntityType[] = [
            'ip', 'user', 'device', 'vendor', 'employee',
            'asset', 'vulnerability', 'threat', 'code_file', 'api_endpoint', 'domain'
        ];
        entityTypes.forEach(type => this.entityIndex.set(type, new Set()));
    }

    /**
     * Add or update an entity
     */
    upsertEntity(entity: Omit<Entity, 'id' | 'firstSeen' | 'lastSeen'>): Entity {
        const existingId = this.findEntityId(entity.type, entity.name);
        const now = new Date();

        if (existingId) {
            const existing = this.entities.get(existingId)!;
            const updated: Entity = {
                ...existing,
                properties: { ...existing.properties, ...entity.properties },
                riskScore: entity.riskScore !== undefined ? entity.riskScore : existing.riskScore,
                tags: [...new Set([...existing.tags, ...entity.tags])],
                lastSeen: now,
            };
            this.entities.set(existingId, updated);
            return updated;
        }

        const id = this.generateId(entity.type, entity.name);
        const newEntity: Entity = {
            ...entity,
            id,
            firstSeen: now,
            lastSeen: now,
        };

        this.entities.set(id, newEntity);
        this.entityIndex.get(entity.type)?.add(id);

        return newEntity;
    }

    /**
     * Add a relationship between entities
     */
    addRelationship(
        sourceId: string,
        targetId: string,
        type: RelationType,
        properties: Record<string, any> = {},
        weight: number = 1
    ): Relationship | null {
        if (!this.entities.has(sourceId) || !this.entities.has(targetId)) {
            return null;
        }

        const id = `${sourceId}-${type}-${targetId}`;

        const relationship: Relationship = {
            id,
            sourceId,
            targetId,
            type,
            properties,
            weight,
            createdAt: new Date(),
        };

        this.relationships.set(id, relationship);

        // Index for fast lookup
        const sourceKey = `source:${sourceId}`;
        const targetKey = `target:${targetId}`;

        if (!this.relationshipIndex.has(sourceKey)) {
            this.relationshipIndex.set(sourceKey, new Set());
        }
        if (!this.relationshipIndex.has(targetKey)) {
            this.relationshipIndex.set(targetKey, new Set());
        }

        this.relationshipIndex.get(sourceKey)?.add(id);
        this.relationshipIndex.get(targetKey)?.add(id);

        return relationship;
    }

    /**
     * Get entity by ID
     */
    getEntity(id: string): Entity | undefined {
        return this.entities.get(id);
    }

    /**
     * Get all entities of a type
     */
    getEntitiesByType(type: EntityType): Entity[] {
        const ids = this.entityIndex.get(type) || new Set();
        return Array.from(ids).map(id => this.entities.get(id)!);
    }

    /**
     * Get relationships from an entity
     */
    getOutgoingRelationships(entityId: string): Relationship[] {
        const ids = this.relationshipIndex.get(`source:${entityId}`) || new Set();
        return Array.from(ids).map(id => this.relationships.get(id)!);
    }

    /**
     * Get relationships to an entity
     */
    getIncomingRelationships(entityId: string): Relationship[] {
        const ids = this.relationshipIndex.get(`target:${entityId}`) || new Set();
        return Array.from(ids).map(id => this.relationships.get(id)!);
    }

    /**
     * Find attack paths to critical assets
     */
    findAttackPaths(
        targetId: string,
        maxDepth: number = 5
    ): AttackPath[] {
        const paths: AttackPath[] = [];
        const target = this.entities.get(targetId);
        if (!target) return paths;

        // BFS to find all paths from external entities to target
        const externalEntities = this.getEntitiesByType('ip')
            .filter(e => e.riskScore > 50);

        for (const source of externalEntities) {
            const path = this.findPath(source.id, targetId, maxDepth);
            if (path.length > 0) {
                const attackPath = this.buildAttackPath(path);
                if (attackPath.totalRisk > 0) {
                    paths.push(attackPath);
                }
            }
        }

        // Sort by risk
        return paths.sort((a, b) => b.totalRisk - a.totalRisk);
    }

    /**
     * Find toxic combinations of risks
     */
    findToxicCombinations(): ToxicCombination[] {
        const combinations: ToxicCombination[] = [];

        // Pattern 1: High-risk vendor with DB access
        const vendors = this.getEntitiesByType('vendor').filter(v => v.riskScore > 60);
        const assets = this.getEntitiesByType('asset').filter(a =>
            a.tags.includes('database') || a.tags.includes('pii')
        );

        for (const vendor of vendors) {
            for (const asset of assets) {
                const hasAccess = this.hasPath(vendor.id, asset.id, 3);
                if (hasAccess) {
                    combinations.push({
                        entities: [vendor, asset],
                        risk: 'Data breach via vendor',
                        description: `High-risk vendor "${vendor.name}" has access path to sensitive asset "${asset.name}"`,
                        priority: 'high',
                    });
                }
            }
        }

        // Pattern 2: Vulnerability + External exposure
        const vulns = this.getEntitiesByType('vulnerability').filter(v => v.riskScore > 70);
        const endpoints = this.getEntitiesByType('api_endpoint').filter(e =>
            e.properties.isPublic || e.tags.includes('external')
        );

        for (const vuln of vulns) {
            for (const endpoint of endpoints) {
                const connected = this.hasPath(vuln.id, endpoint.id, 2);
                if (connected) {
                    combinations.push({
                        entities: [vuln, endpoint],
                        risk: 'Exploitable external vulnerability',
                        description: `Critical vulnerability "${vuln.name}" is reachable via public endpoint "${endpoint.name}"`,
                        priority: 'critical',
                    });
                }
            }
        }

        // Pattern 3: Employee with multiple access violations
        const employees = this.getEntitiesByType('employee')
            .filter(e => (e.properties.violations || 0) > 2);

        for (const employee of employees) {
            const accessedAssets = this.getOutgoingRelationships(employee.id)
                .filter(r => r.type === 'accessed')
                .map(r => this.entities.get(r.targetId)!)
                .filter(Boolean);

            const sensitiveAssets = accessedAssets.filter(a =>
                a.tags.includes('sensitive') || a.tags.includes('pii')
            );

            if (sensitiveAssets.length > 0) {
                combinations.push({
                    entities: [employee, ...sensitiveAssets],
                    risk: 'Insider threat',
                    description: `Employee "${employee.name}" with ${employee.properties.violations} violations accessing sensitive assets`,
                    priority: employee.properties.violations > 5 ? 'high' : 'medium',
                });
            }
        }

        return combinations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Calculate blast radius of a compromise
     */
    calculateBlastRadius(entityId: string): {
        affectedEntities: Entity[];
        riskScore: number;
        description: string;
    } {
        const affected = new Set<string>();
        const queue = [entityId];
        const maxDepth = 4;
        let depth = 0;

        while (queue.length > 0 && depth < maxDepth) {
            const levelSize = queue.length;

            for (let i = 0; i < levelSize; i++) {
                const current = queue.shift()!;
                if (affected.has(current)) continue;

                affected.add(current);

                // Get all connected entities
                const outgoing = this.getOutgoingRelationships(current);
                for (const rel of outgoing) {
                    if (!affected.has(rel.targetId)) {
                        queue.push(rel.targetId);
                    }
                }
            }

            depth++;
        }

        const affectedEntities = Array.from(affected)
            .map(id => this.entities.get(id)!)
            .filter(Boolean);

        const riskScore = affectedEntities.reduce((sum, e) => sum + (e.riskScore || 0), 0) /
            Math.max(affectedEntities.length, 1);

        const entity = this.entities.get(entityId);

        return {
            affectedEntities,
            riskScore,
            description: `Compromise of ${entity?.name || entityId} could affect ${affectedEntities.length} entities`,
        };
    }

    /**
     * Get graph statistics
     */
    getStats(): {
        totalEntities: number;
        totalRelationships: number;
        entityCounts: Record<EntityType, number>;
        avgRiskScore: number;
        highRiskEntities: number;
    } {
        const entityCounts: Record<string, number> = {};
        let totalRisk = 0;
        let highRiskCount = 0;

        for (const [type, ids] of this.entityIndex) {
            entityCounts[type] = ids.size;
        }

        for (const entity of this.entities.values()) {
            totalRisk += entity.riskScore;
            if (entity.riskScore > 70) highRiskCount++;
        }

        return {
            totalEntities: this.entities.size,
            totalRelationships: this.relationships.size,
            entityCounts: entityCounts as Record<EntityType, number>,
            avgRiskScore: this.entities.size > 0 ? totalRisk / this.entities.size : 0,
            highRiskEntities: highRiskCount,
        };
    }

    /**
     * Export graph for visualization
     */
    exportForVisualization(): {
        nodes: Array<{ id: string; label: string; type: EntityType; risk: number }>;
        edges: Array<{ source: string; target: string; type: RelationType; weight: number }>;
    } {
        const nodes = Array.from(this.entities.values()).map(e => ({
            id: e.id,
            label: e.name,
            type: e.type,
            risk: e.riskScore,
        }));

        const edges = Array.from(this.relationships.values()).map(r => ({
            source: r.sourceId,
            target: r.targetId,
            type: r.type,
            weight: r.weight,
        }));

        return { nodes, edges };
    }

    // Helper methods

    private findEntityId(type: EntityType, name: string): string | undefined {
        const id = this.generateId(type, name);
        return this.entities.has(id) ? id : undefined;
    }

    private generateId(type: EntityType, name: string): string {
        return crypto.createHash('md5').update(`${type}:${name}`).digest('hex').substring(0, 16);
    }

    private findPath(sourceId: string, targetId: string, maxDepth: number): string[] {
        if (sourceId === targetId) return [sourceId];

        const visited = new Set<string>();
        const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];

        while (queue.length > 0) {
            const { id, path } = queue.shift()!;

            if (path.length > maxDepth) continue;
            if (visited.has(id)) continue;
            visited.add(id);

            const relationships = this.getOutgoingRelationships(id);

            for (const rel of relationships) {
                if (rel.targetId === targetId) {
                    return [...path, rel.targetId];
                }

                if (!visited.has(rel.targetId)) {
                    queue.push({ id: rel.targetId, path: [...path, rel.targetId] });
                }
            }
        }

        return [];
    }

    private hasPath(sourceId: string, targetId: string, maxDepth: number): boolean {
        return this.findPath(sourceId, targetId, maxDepth).length > 0;
    }

    private buildAttackPath(nodeIds: string[]): AttackPath {
        const steps: AttackPath['steps'] = [];
        let totalRisk = 0;

        for (let i = 0; i < nodeIds.length - 1; i++) {
            const entity = this.entities.get(nodeIds[i])!;
            const relationships = this.getOutgoingRelationships(nodeIds[i]);
            const rel = relationships.find(r => r.targetId === nodeIds[i + 1]);

            if (entity && rel) {
                const riskContribution = entity.riskScore * rel.weight;
                totalRisk += riskContribution;

                steps.push({
                    entity,
                    relationship: rel,
                    action: this.getActionDescription(rel.type),
                    riskContribution,
                });
            }
        }

        // Add final entity
        const lastEntity = this.entities.get(nodeIds[nodeIds.length - 1]);
        if (lastEntity) {
            totalRisk += lastEntity.riskScore;
        }

        return {
            id: crypto.randomUUID(),
            steps,
            totalRisk,
            description: this.buildPathDescription(steps),
            mitigations: this.suggestMitigations(steps),
        };
    }

    private getActionDescription(type: RelationType): string {
        const descriptions: Record<RelationType, string> = {
            accessed: 'Gain access to',
            depends_on: 'Exploit dependency',
            communicates_with: 'Lateral movement to',
            has_vulnerability: 'Exploit vulnerability in',
            exploits: 'Execute exploit against',
            owns: 'Compromise owned',
            manages: 'Abuse management access to',
            triggered: 'Trigger action on',
            blocked: 'Attempt blocked at',
            similar_to: 'Pivot to similar',
        };
        return descriptions[type] || 'Interact with';
    }

    private buildPathDescription(steps: AttackPath['steps']): string {
        if (steps.length === 0) return 'No attack path';

        const descriptions = steps.map((step, i) =>
            `${i + 1}. ${step.action} ${step.entity.name}`
        );

        return descriptions.join(' → ');
    }

    private suggestMitigations(steps: AttackPath['steps']): string[] {
        const mitigations: string[] = [];

        for (const step of steps) {
            switch (step.relationship.type) {
                case 'has_vulnerability':
                    mitigations.push(`Patch vulnerability in ${step.entity.name}`);
                    break;
                case 'accessed':
                    mitigations.push(`Review access controls for ${step.entity.name}`);
                    break;
                case 'communicates_with':
                    mitigations.push(`Implement network segmentation`);
                    break;
                case 'exploits':
                    mitigations.push(`Enable exploit protection for ${step.entity.name}`);
                    break;
            }
        }

        return [...new Set(mitigations)];
    }
}

// Export singleton
export const securityGraph = new SecurityGraph();
