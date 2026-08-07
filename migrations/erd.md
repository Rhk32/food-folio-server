```mermaid
erDiagram
    %% ================= ENTITIES =================
    USER {
        uuid id PK
        string name
        string email
        string password_hash
        string profile_picture_url
        string current_city
        string current_country
        string role "User / Manager / Admin"
        geography location "PostGIS point for coordinates"
        timestamp created_at
    }

    FOLLOW {
        uuid follower_id PK,FK
        uuid following_id PK,FK
        timestamp created_at
    }

    RESTAURANT {
        uuid id PK
        string name
        string logo_url
        text description
        integer view_count "For trending/marquee slider"
        timestamp created_at
    }

    RESTAURANT_MANAGER {
        uuid user_id PK,FK
        uuid restaurant_id PK,FK
    }

    BRANCH {
        uuid id PK
        uuid restaurant_id FK
        string branch_name
        string address
        string city
        geography coordinates "PostGIS point for Maps"
        string google_maps_url
    }

    CUISINE {
        uuid id PK
        string name
    }

    RESTAURANT_CUISINE {
        uuid restaurant_id PK,FK
        uuid cuisine_id PK,FK
    }

    MENU_ITEM {
        uuid id PK
        uuid branch_id FK
        string name
        text description
        decimal price
    }

    REVIEW {
        uuid id PK
        uuid user_id FK
        uuid branch_id FK
        text content
        integer rating
        integer vouch_count "Denormalized for feed performance"
        timestamp created_at
    }

    VOUCH {
        uuid id PK
        uuid user_id FK
        uuid review_id FK
        timestamp created_at
    }

    COMMENT {
        uuid id PK
        uuid user_id FK
        uuid review_id FK
        text content
        timestamp created_at
    }

    GALLERY_IMAGE {
        uuid id PK
        uuid restaurant_id FK
        uuid branch_id FK
        uuid user_id FK "Nullable if uploaded by admin"
        uuid review_id FK "Nullable if not from a review"
        string image_url
        boolean is_approved "For dashboard moderation"
        timestamp created_at
    }

    SITE_SETTING {
        uuid id PK
        string problem "e.g., support, auth problem"
        text contact "email of support"
    }

    %% ================= RELATIONSHIPS =================
    USER ||--o{ FOLLOW : "is follower in"
    USER ||--o{ FOLLOW : "is following in"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ VOUCH : "gives"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ GALLERY_IMAGE : "uploads"
    USER ||--o{ RESTAURANT_MANAGER : "manages"

    RESTAURANT ||--o{ RESTAURANT_MANAGER : "has"
    RESTAURANT ||--o{ BRANCH : "operates"
    RESTAURANT ||--o{ RESTAURANT_CUISINE : "has"
    RESTAURANT ||--o{ GALLERY_IMAGE : "owns"

    BRANCH ||--o{ REVIEW : "receives"
    BRANCH ||--o{ MENU_ITEM : "serves"
    BRANCH ||--o{ GALLERY_IMAGE : "has"

    CUISINE ||--o{ RESTAURANT_CUISINE : "categorizes"

    REVIEW ||--o{ VOUCH : "receives"
    REVIEW ||--o{ COMMENT : "has"
    REVIEW ||--o| GALLERY_IMAGE : "generates"
