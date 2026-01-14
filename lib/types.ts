// Activity payload extracted from Wordwall HTML
export interface ActivityPayload {
    id: string;
    url: string;
    title: string;
    template: string; // 'MatchUp', 'Quiz', 'Flashcard', etc.
    content: {
        items: ActivityItem[];
        settings?: Record<string, any>;
    };
    metadata?: {
        author?: string;
        createdAt?: string;
        language?: string;
    };
}

export interface ActivityItem {
    id?: string;
    question?: string;
    answer?: string;
    term?: string;
    definition?: string;
    options?: string[];
    correctAnswer?: string | number;
    image?: string;
}

// H5P package structure
export interface H5PPackageData {
    h5pJson: H5PJson;
    contentJson: Record<string, any>;
}

export interface H5PJson {
    title: string;
    language: string;
    mainLibrary: string;
    embedTypes: string[];
    license?: string;
    preloadedDependencies: H5PDependency[];
}

export interface H5PDependency {
    machineName: string;
    majorVersion: number;
    minorVersion: number;
}

// Conversion request/response
export interface ConversionRequest {
    wordwallUrl: string;
    attestOwnership: boolean;
    userId?: string;
}

export interface ConversionResponse {
    success: boolean;
    conversionId: string;
    template: string;
    packageUrl?: string;
    error?: string;
    latencyMs?: number;
}

// Error types
export class ExtractionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExtractionError';
    }
}

export class PackagingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PackagingError';
    }
}

export class RateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateLimitError';
    }
}
