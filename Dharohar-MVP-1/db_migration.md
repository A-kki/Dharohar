# AWS Migration Guide: Dharohar Application
This document provides a comprehensive, step-by-step guide to migrating the Dharohar application from a MongoDB/Express stack to a fully AWS-native architecture utilizing **DynamoDB, S3, EC2, and Lambda**.

## Phase 1: Preparation & Branching Strategy

Since multiple developers are working on the project remotely, a coordinated branching and IAM strategy is critical.

### 1. Version Control Synchronization
1. **Commit Current Work**: Ensure all developers commit and push their current work on their respective branches.
2. **Create a Migration Branch**: Base your migration work off a stable branch (like `main` or `develop`).
   ```bash
   git checkout -b feature/aws-migration
   git push -u origin feature/aws-migration
   ```
3. Both developers should pull this branch and base their local work on it.

### 2. AWS IAM (Identity and Access Management) Setup
> [!CAUTION]
> **Never use the AWS Root Account for development.**

1. Log in to the AWS Console (as an administrator).
2. Navigate to **IAM > Users** and create individual users for each developer (e.g., `dev-aditya`, `dev-teammate`).
3. Attach policies necessary for the migration:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonEC2FullAccess`
   - `AWSLambda_FullAccess`
4. Generate **Access Keys** for each user.
5. Store these keys locally in your `.env` files:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=ap-south-1
   ```
> [!IMPORTANT]
> Ensure `.env` is listed in your `.gitignore` file. Never commit AWS credentials to GitHub!

---

## Phase 2: Database Migration (MongoDB to DynamoDB)

Moving from a document database (MongoDB) to a NoSQL key-value store (DynamoDB) is the most significant architectural change.

### 1. Data Remodeling
MongoDB allows flexible, nested documents. DynamoDB requires careful planning of Access Patterns, Partition Keys (PK), and Sort Keys (SK).

*   **Approach A: Multi-Table Design (Recommended for Beginners)**
    Create separate DynamoDB tables matching your MongoDB collections (e.g., `UsersTable`, `AssetsTable`, `LicensesTable`).
*   **Approach B: Single-Table Design (Advanced)**
    Combine all entities into one table, differentiating them by prefixes.
    *   *PK:* `USER#123` | *SK:* `PROFILE`
    *   *PK:* `USER#123` | *SK:* `ASSET#456`

### 2. Dependency Changes
1. Uninstall MongoDB and Mongoose:
   ```bash
   npm uninstall mongoose mongodb
   ```
2. Install the AWS SDK for DynamoDB:
   ```bash
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

### 3. Code Modifications
Replace Mongoose schema definitions with DynamoDB DocumentClient operations.

**MongoDB Example:**
```javascript
const user = await User.findById(userId);
```

**DynamoDB Example:**
```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const command = new GetCommand({
  TableName: "UsersTable",
  Key: { id: userId }
});
const response = await docClient.send(command);
const user = response.Item;
```

### 4. Handling Authentication (Login/Register)
The current stack handles authentication using MongoDB and `User.findOne({ email: req.body.email })`. When MongoDB is removed, this breaks. 
Because DynamoDB does not allow you to easily search by non-primary variables unless you explicitly index them, you **must** configure your `UsersTable` properly to allow email logins.

1. **Create a Global Secondary Index (GSI):** When creating the `UsersTable`, add a GSI where `email` is the Partition Key.
2. **Update the Login Controller:**
   ```javascript
   // Old MongoDB Call
   // const user = await User.findOne({ email });

   // New DynamoDB Call (Using the GSI)
   const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
   
   const command = new QueryCommand({
     TableName: "UsersTable",
     IndexName: "EmailIndex", // This must match the GSI name created in AWS
     KeyConditionExpression: "email = :email",
     ExpressionAttributeValues: { ":email": userEmail }
   });
   const response = await docClient.send(command);
   const user = response.Items[0];
   ```
3. Pass the fetched `user` back into your existing `bcryptjs` and `jsonwebtoken` login logic.

### 5. Data Migration Script
Create a one-off script (`scripts/migrate-db.js`) to move existing data.
1. Connect to your existing MongoDB instance.
2. Read documents in batches (e.g., 100 at a time).
3. Transform Mongo `_id` objects to standard string UUIDs.
4. Use DynamoDB's `BatchWriteCommand` to insert the items.

---

## Phase 3: File Storage Migration (Local to S3)

Your application currently handles media uploads, likely using `multer` for local storage. We will shift this entirely to Amazon S3.

### 1. Package Updates
```bash
npm install @aws-sdk/client-s3 multer-s3
```

### 2. Upload Implementation Options

**Option A: Direct to S3 via Server (using `multer-s3`)**
Updates your Express endpoints to stream files to S3 directly:
```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'dharohar-assets-bucket',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

app.post('/upload', upload.single('media'), (req, res) => {
  res.send(`Successfully uploaded to ${req.file.location}`);
});
```

**Option B: Pre-Signed URLs (Recommended Architecture)**
1. **Backend**: Express generates a short-lived "Pre-signed URL" using the S3 SDK and sends it to the frontend.
2. **Frontend**: React uses the URL to upload the file directly to S3.
*Benefit: This takes the upload bandwidth totally off your EC2 server, saving compute resources and costs.*

### 3. Migrating Existing Files
If you have local files, sync them to your new S3 bucket via the AWS CLI:
```bash
aws s3 sync ./path/to/local/uploads s3://dharohar-assets-bucket/uploads/
```

---

## Phase 4: Compute & Hosting (EC2 & Lambda)

We will use a hybrid approach: **EC2** for the main Express API and **Lambda** to offload heavy asynchronous processing (like FFmpeg).

### 1. Deploying the API on EC2
Since the core application is Express.js, EC2 provides a familiar environment.

1. **Provision EC2**: Launch an Ubuntu instance in the AWS Console. Open ports `80` (HTTP), `443` (HTTPS), and `22` (SSH) in the Security Group.
2. **Setup Server**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   ```
3. **Deploy Code**:
   Clone your repository, check out `feature/aws-migration`, and run `npm install`.
4. **Process Management**:
   Use PM2 to keep the Node app running.
   ```bash
   sudo npm install -g pm2
   pm2 start server/server.js --name dharohar-api
   pm2 startup
   ```
5. **Reverse Proxy & SSL**:
   Configure Nginx to route traffic from Port 80 to your Node app port (e.g., 5000). Use Let's Encrypt / Certbot to add a free SSL certificate.

### 2. Offloading with AWS Lambda (Event-Driven Processing)
The application uses `fluent-ffmpeg`. Running video/audio conversion on your EC2 API server blocks the event loop and can crash the server under load.

**The Workflow:**
1. User uploads a video directly to the S3 bucket (`/raw-uploads`).
2. S3 is configured to trigger an AWS Lambda function automatically upon a new upload.
3. The Lambda function (containing FFmpeg) downloads the file, processes it, and saves the output back to S3 (`/processed-uploads`).
4. (Optional) Lambda updates DynamoDB to mark the asset as "Processed".

> [!TIP]
> **Serverless Framework / AWS SAM:** Instead of clicking around the AWS console to create Lambdas, consider defining your Lambda function in code using the Serverless Framework. This keeps your infrastructure version-controlled and reproducible!

---

## Action Plan checklist

### Developer 1 tasks:
- [ ] Initialize the `feature/aws-migration` branch.
- [ ] Rewrite Express API data access layers to use the DynamoDB AWS SDK.
- [ ] Write and execute the MongoDB-to-DynamoDB migration script.

### Developer 2 tasks:
- [ ] Provision AWS resources (IAM Users, S3 Buckets, DynamoDB Tables).
- [ ] Refactor upload logic to use `multer-s3` or Pre-signed URLs.
- [ ] Extract FFmpeg processing logic into a standalone Lambda function that responds to S3 events.

### Joint tasks:
- [ ] Merge the work on `feature/aws-migration`.
- [ ] Deploy the merged branch to the EC2 instance using PM2 and Nginx.
- [ ] Perform end-to-end testing of the upload, processing, and database workflows.
