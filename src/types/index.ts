// src/types/index.ts
export interface Profile {
    name: string;
    title: string;
    image: string;
    bio: string;
}

export interface Skill {
    id: string;
    name: string;
    level: string; // e.g., "beginner", "intermediate", "advanced"
}

export interface Project {
    id: string;
    title: string;
    description: string;
    link: string; // URL to the project
}

export interface CV {
    id: string;
    personalInfo: Profile;
    skills: Skill[];
    projects: Project[];
}

// SirvConfig 
export interface SirvConfig {
    clientId: string;
    clientSecret: string;
    baseUrl: string;
    uploadPath: string;
    tokenPath: string;
    domain: string;
  }

  // TokenResponse
export interface TokenResponse {
    token: string;
    expiresIn: number;
  }
  