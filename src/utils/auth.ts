import fs from 'node:fs';
import path from 'node:path';

interface AuthData {
    enabled: boolean;
    authorizedUsers: string[];
}

const DB = path.join(process.cwd(), 'auth.json');

const defaut: AuthData = {
    enabled: true,
    authorizedUsers: []
};

export function loader(): AuthData {
    try {
        if (fs.existsSync(DB)) {
            const data = fs.readFileSync(DB, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading auth data:', err);
    }

    return { ...defaut };
}

export function save(data: AuthData): void {
    try {
        fs.writeFileSync(DB, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving auth data:', err);
    }
}

export function isAuthorized(userId: string): boolean {
    const data = loader();
    
    if (!data.enabled) {
        return true;
    }
    
    return data.authorizedUsers.includes(userId);
}

export function add(userId: string): boolean {
    const data = loader();
    
    if (data.authorizedUsers.includes(userId)) {
        return false;
    }
    
    data.authorizedUsers.push(userId);
    save(data);

    return true;
}

export function remove(userId: string): boolean {
    const data = loader();
    
    const index = data.authorizedUsers.indexOf(userId);
    if (index === -1) {
        return false;
    }
    
    data.authorizedUsers.splice(index, 1);
    save(data);

    return true;
}

export function getAll(): string[] {
    const data = loader();
    return [...data.authorizedUsers];
}

export function setStatus(enabled: boolean): void {
    const data = loader();
    data.enabled = enabled;

    save(data);
}

export function isEnabled(): boolean {
    const data = loader();
    return data.enabled;
}
