# AI Agent: AWS Migration Task Guide

## 🎯 Mission Objective
Migrate the Dharohar application from MongoDB/Express to AWS (DynamoDB, S3, EC2, Lambda) following a coordinated two-developer workflow.

---

## 📊 Current State Analysis

### Project Structure
- **Frontend**: React/Vite application in `/frontend`
- **Backend**: Node/Express API in `/server`
- **Database**: MongoDB (currently running locally)
- **File Storage**: Local file system (needs migration to S3)
- **Processing**: FFmpeg running on server (needs migration to Lambda)

### Developer Roles
- **Developer 1 (You)**: MongoDB setup on local system, working on `main` branch
- **Developer 2 (Friend)**: Will handle DB migration, working on separate branch

---

## 🚀 EXECUTION PLAN

### PHASE 1: Pre-Migration Setup (Priority: CRITICAL)

#### Task 1.1: AWS Account & IAM Configuration
**Assignee**: Developer 2
**Duration**: 30 minutes

**Actions**:
1. Access AWS Console as administrator
2. Navigate to IAM → Users
3. Create IAM users:
   ```
   Username: dev-developer1
   Username: dev-developer2
   ```
4. Attach policies to BOTH users:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonEC2FullAccess`
   - `AWSLambda_FullAccess`
5. Generate Access Keys for each user
6. Securely share credentials (use encrypted channel, NOT git)

**Verification**:
- [ ] Two IAM users created
- [ ] All four policies attached to each user
- [ ] Access keys generated and shared
- [ ] Credentials NOT committed to repository

#### Task 1.2: Local Environment Configuration
**Assignee**: BOTH developers
**Duration**: 15 minutes

**Actions**:
```bash
# Navigate to server directory
cd server

# Create .env file (if not exists)
touch .env

# Add AWS credentials
cat >> .env << EOF
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
AWS_REGION=ap-south-1
EOF

# Ensure .env is gitignored
grep -q "^\.env$" ../.gitignore || echo ".env" >> ../.gitignore
```

**Verification**:
- [ ] `.env` file exists in `/server` directory
- [ ] AWS credentials populated
- [ ] `.env` listed in `.gitignore`
- [ ] No credentials in git history

#### Task 1.3: Git Branching Strategy
**Assignee**: Developer 1
**Duration**: 10 minutes

**Actions**:
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create migration branch
git checkout -b feature/aws-migration

# Push to remote
git push -u origin feature/aws-migration

# Verify branch creation
git branch -a | grep aws-migration
```

**Developer 2 Actions**:
```bash
# Fetch all branches
git fetch origin

# Checkout migration branch
git checkout feature/aws-migration

# Verify you're on correct branch
git branch --show-current
```

**Verification**:
- [ ] `feature/aws-migration` branch exists on remote
- [ ] Both developers on same branch locally
- [ ] No uncommitted changes on main

---

### PHASE 2: AWS Resource Provisioning (Priority: HIGH)

#### Task 2.1: DynamoDB Tables Creation
**Assignee**: Developer 2
**Duration**: 45 minutes

**Actions for UsersTable**:
1. AWS Console → DynamoDB → Tables → Create table
2. Configuration:
   ```
   Table name: UsersTable
   Partition key: id (String)
   
   Settings:
   - Billing mode: On-demand (or Provisioned: 5 RCU, 5 WCU)
   - Encryption: AWS owned key
   ```
3. After creation, create Global Secondary Index:
   ```
   Index name: EmailIndex
   Partition key: email (String)
   Projected attributes: All
   ```

**Actions for AssetsTable**:
```
Table name: AssetsTable
Partition key: id (String)

GSI Configuration:
Index name: UserIdIndex
Partition key: userId (String)
```

**Actions for LicensesTable**:
```
Table name: LicensesTable
Partition key: id (String)

GSI Configuration:
Index name: AssetIdIndex
Partition key: assetId (String)

Index name: UserIdIndex
Partition key: userId (String)
```

**Verification**:
- [ ] Three tables visible in DynamoDB console
- [ ] EmailIndex exists on UsersTable
- [ ] UserIdIndex exists on AssetsTable
- [ ] Both indexes exist on LicensesTable
- [ ] All tables in "Active" state

#### Task 2.2: S3 Buckets Creation
**Assignee**: Developer 2
**Duration**: 20 minutes

**Actions**:
```bash
# Using AWS CLI (preferred)
aws s3 mb s3://dharohar-assets-bucket --region ap-south-1
aws s3 mb s3://dharohar-raw-uploads --region ap-south-1
aws s3 mb s3://dharohar-processed-uploads --region ap-south-1

# Configure CORS for dharohar-assets-bucket
cat > cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket dharohar-assets-bucket --cors-configuration file://cors-config.json
```

**OR via Console**:
1. S3 → Create bucket
2. Bucket names: 
   - `dharohar-assets-bucket`
   - `dharohar-raw-uploads`
   - `dharohar-processed-uploads`
3. Region: Asia Pacific (Mumbai) ap-south-1
4. Block Public Access: Keep enabled (use pre-signed URLs)
5. Versioning: Disabled (for now)
6. Encryption: Enabled (SSE-S3)

**Verification**:
- [ ] Three S3 buckets created
- [ ] All in ap-south-1 region
- [ ] CORS configured on assets bucket
- [ ] Buckets accessible via AWS CLI

---

### PHASE 3: Code Migration - File Storage (Priority: HIGH)

#### Task 3.1: Install S3 Dependencies
**Assignee**: Developer 1
**Duration**: 10 minutes

**Actions**:
```bash
cd server

# Install S3 packages
npm install @aws-sdk/client-s3 multer-s3

# Update package.json
npm install

# Verify installation
npm list @aws-sdk/client-s3 multer-s3
```

**Verification**:
- [ ] Packages in `package.json`
- [ ] No installation errors
- [ ] `node_modules` updated

#### Task 3.2: Create S3 Configuration Module
**Assignee**: Developer 1
**Duration**: 30 minutes

**Actions**:
```bash
# Create config file
touch server/config/s3.config.js
```

**File Content** (`server/config/s3.config.js`):
```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Initialize S3 Client
const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure Multer-S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'dharohar-assets-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { 
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = file.originalname.split('.').pop();
      const filename = `${file.fieldname}-${uniqueSuffix}.${extension}`;
      
      // Organize by upload type
      const folder = file.fieldname || 'misc';
      cb(null, `uploads/${folder}/${filename}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images, videos, audio, and documents
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, audio, and documents allowed.'));
    }
  }
});

module.exports = { s3Client, upload };
```

**Verification**:
- [ ] File created at correct path
- [ ] No syntax errors
- [ ] Imports resolve correctly

#### Task 3.3: Update Upload Routes
**Assignee**: Developer 1
**Duration**: 45 minutes

**Identify Current Upload Routes**:
```bash
# Find all multer usage
grep -r "multer" server/routes/
grep -r "upload" server/routes/
```

**Update Pattern** (Example for `server/routes/assets.routes.js`):

**BEFORE**:
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadController);
```

**AFTER**:
```javascript
const { upload } = require('../config/s3.config');

// Single file upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.status(200).json({
    message: 'File uploaded successfully',
    file: {
      location: req.file.location,  // S3 URL
      key: req.file.key,            // S3 key
      bucket: req.file.bucket,
      size: req.file.size
    }
  });
});

// Multiple files upload
router.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const uploadedFiles = req.files.map(file => ({
    location: file.location,
    key: file.key,
    size: file.size
  }));
  
  res.status(200).json({
    message: 'Files uploaded successfully',
    files: uploadedFiles
  });
});
```

**Update ALL Routes**:
- Check `/server/routes/assets.routes.js`
- Check `/server/routes/users.routes.js`
- Check any other routes with file uploads

**Verification**:
- [ ] All multer imports updated
- [ ] All upload middleware uses S3 config
- [ ] Response objects return S3 URLs
- [ ] Error handling implemented

#### Task 3.4: Update Controllers to Handle S3 URLs
**Assignee**: Developer 1
**Duration**: 30 minutes

**Update Asset Controller** (Example):

**File**: `server/controllers/assets.controller.js`

```javascript
// BEFORE: Saving local file path
const createAsset = async (req, res) => {
  const asset = new Asset({
    title: req.body.title,
    filePath: req.file.path  // Local path
  });
  await asset.save();
};

// AFTER: Saving S3 URL
const createAsset = async (req, res) => {
  const asset = new Asset({
    title: req.body.title,
    fileUrl: req.file.location,     // S3 URL
    fileKey: req.file.key,          // S3 key for deletion
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  });
  await asset.save();
};
```

**Verification**:
- [ ] All controllers updated
- [ ] S3 URLs stored instead of local paths
- [ ] S3 keys stored for future deletion

#### Task 3.5: Migrate Existing Files to S3
**Assignee**: Developer 1
**Duration**: 20 minutes

**Actions**:
```bash
# Check if local uploads exist
ls -la server/uploads/ || echo "No local uploads directory"

# If uploads exist, sync to S3
aws s3 sync server/uploads/ s3://dharohar-assets-bucket/uploads/ \
  --region ap-south-1 \
  --exclude "*.tmp" \
  --exclude ".DS_Store"

# Verify sync
aws s3 ls s3://dharohar-assets-bucket/uploads/ --recursive
```

**Create Migration Record**:
```bash
# Document migrated files
aws s3 ls s3://dharohar-assets-bucket/uploads/ --recursive > migration-log.txt
echo "Total files migrated: $(wc -l < migration-log.txt)"
```

**Verification**:
- [ ] All local files synced to S3
- [ ] File count matches
- [ ] Files accessible via S3 console
- [ ] Migration log created

#### Task 3.6: Test S3 Upload Functionality
**Assignee**: Developer 1
**Duration**: 30 minutes

**Actions**:
```bash
# Start server
cd server
npm start

# Test upload with curl (in another terminal)
curl -X POST http://localhost:5000/api/assets/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# Expected response:
# {
#   "message": "File uploaded successfully",
#   "file": {
#     "location": "https://dharohar-assets-bucket.s3.ap-south-1.amazonaws.com/uploads/...",
#     "key": "uploads/file-1234567890.jpg",
#     "size": 123456
#   }
# }
```

**Verification Tests**:
- [ ] Single file upload works
- [ ] Multiple file upload works
- [ ] File appears in S3 console
- [ ] S3 URL accessible
- [ ] Error handling for invalid files
- [ ] File size limits enforced

#### Task 3.7: Commit File Storage Changes
**Assignee**: Developer 1
**Duration**: 15 minutes

**Actions**:
```bash
# Stage changes
git add server/config/s3.config.js
git add server/routes/
git add server/controllers/
git add package.json package-lock.json

# Commit with descriptive message
git commit -m "feat: migrate file storage from local to AWS S3

- Add S3 configuration with multer-s3
- Update all upload routes to use S3
- Update controllers to store S3 URLs
- Add file type validation and size limits
- Migrate existing uploads to S3 bucket"

# Push to remote
git push origin feature/aws-migration
```

**Verification**:
- [ ] Changes committed
- [ ] Commit message descriptive
- [ ] Pushed to correct branch
- [ ] No sensitive data in commit

---

### PHASE 4: Code Migration - Database (Priority: CRITICAL)

#### Task 4.1: Install DynamoDB Dependencies
**Assignee**: Developer 2
**Duration**: 15 minutes

**Actions**:
```bash
cd server

# Remove MongoDB packages
npm uninstall mongoose mongodb

# Install DynamoDB packages
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Install UUID for generating IDs
npm install uuid

# Verify installation
npm list @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid
```

**Verification**:
- [ ] Mongoose removed from package.json
- [ ] DynamoDB packages installed
- [ ] No dependency conflicts
- [ ] Lock file updated

#### Task 4.2: Create DynamoDB Configuration Module
**Assignee**: Developer 2
**Duration**: 30 minutes

**Actions**:
```bash
# Create config file
touch server/config/dynamodb.config.js
```

**File Content** (`server/config/dynamodb.config.js`):
```javascript
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();

// Create DynamoDB client
const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Create Document Client with marshalling options
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    // Whether to automatically convert empty strings, blobs, and sets to `null`
    convertEmptyValues: false,
    // Whether to remove undefined values while marshalling
    removeUndefinedValues: true,
    // Whether to convert typeof object to map attribute
    convertClassInstanceToMap: false
  },
  unmarshallOptions: {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers
    wrapNumbers: false
  }
});

// Table names
const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'UsersTable',
  ASSETS: process.env.DYNAMODB_ASSETS_TABLE || 'AssetsTable',
  LICENSES: process.env.DYNAMODB_LICENSES_TABLE || 'LicensesTable'
};

module.exports = { docClient, TABLES };
```

**Update .env**:
```bash
cat >> server/.env << EOF

# DynamoDB Tables
DYNAMODB_USERS_TABLE=UsersTable
DYNAMODB_ASSETS_TABLE=AssetsTable
DYNAMODB_LICENSES_TABLE=LicensesTable
EOF
```

**Verification**:
- [ ] Config file created
- [ ] No syntax errors
- [ ] Table names configurable
- [ ] Credentials properly loaded

#### Task 4.3: Create DynamoDB Service Layer
**Assignee**: Developer 2
**Duration**: 90 minutes

**Create Base Service** (`server/services/dynamodb.service.js`):
```javascript
const { 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand,
  ScanCommand 
} = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/dynamodb.config");

class DynamoDBService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Get item by primary key
  async getById(id) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id }
    });
    
    const response = await docClient.send(command);
    return response.Item;
  }

  // Create new item
  async create(item) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    
    await docClient.send(command);
    return item;
  }

  // Update item
  async update(id, updates) {
    // Build update expression dynamically
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.keys(updates).forEach((key, index) => {
      updateExpression.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });
    
    // Add updatedAt timestamp
    updateExpression.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await docClient.send(command);
    return response.Attributes;
  }

  // Delete item
  async delete(id) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id }
    });
    
    await docClient.send(command);
    return true;
  }

  // Query by index
  async queryByIndex(indexName, keyName, keyValue, limit = 50) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: indexName,
      KeyConditionExpression: `#key = :value`,
      ExpressionAttributeNames: { '#key': keyName },
      ExpressionAttributeValues: { ':value': keyValue },
      Limit: limit
    });
    
    const response = await docClient.send(command);
    return response.Items || [];
  }

  // Scan all items (use sparingly, expensive operation)
  async scanAll(limit = 100) {
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit
    });
    
    const response = await docClient.send(command);
    return response.Items || [];
  }
}

module.exports = DynamoDBService;
```

**Create User Service** (`server/services/user.service.js`):
```javascript
const DynamoDBService = require('./dynamodb.service');
const { TABLES } = require('../config/dynamodb.config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class UserService extends DynamoDBService {
  constructor() {
    super(TABLES.USERS);
  }

  // Find user by email (uses EmailIndex GSI)
  async findByEmail(email) {
    const users = await this.queryByIndex('EmailIndex', 'email', email, 1);
    return users[0] || null;
  }

  // Create new user with hashed password
  async createUser(userData) {
    const { email, password, name, role = 'user' } = userData;
    
    // Check if user exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.create(user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Verify user password
  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user (prevents password update through this method)
  async updateUser(id, updates) {
    // Remove password from updates if present
    const { password, ...safeUpdates } = updates;
    return await this.update(id, safeUpdates);
  }

  // Change password
  async changePassword(id, oldPassword, newPassword) {
    const user = await this.getById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid old password');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.update(id, { password: hashedPassword });
    
    return true;
  }
}

module.exports = new UserService();
```

**Create Asset Service** (`server/services/asset.service.js`):
```javascript
const DynamoDBService = require('./dynamodb.service');
const { TABLES } = require('../config/dynamodb.config');
const { v4: uuidv4 } = require('uuid');

class AssetService extends DynamoDBService {
  constructor() {
    super(TABLES.ASSETS);
  }

  // Create new asset
  async createAsset(assetData) {
    const asset = {
      id: uuidv4(),
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await this.create(asset);
  }

  // Get assets by user ID
  async getAssetsByUserId(userId, limit = 50) {
    return await this.queryByIndex('UserIdIndex', 'userId', userId, limit);
  }

  // Update asset
  async updateAsset(id, updates) {
    return await this.update(id, updates);
  }

  // Delete asset
  async deleteAsset(id) {
    return await this.delete(id);
  }

  // Get all assets (paginated)
  async getAllAssets(limit = 100) {
    return await this.scanAll(limit);
  }
}

module.exports = new AssetService();
```

**Create License Service** (`server/services/license.service.js`):
```javascript
const DynamoDBService = require('./dynamodb.service');
const { TABLES } = require('../config/dynamodb.config');
const { v4: uuidv4 } = require('uuid');

class LicenseService extends DynamoDBService {
  constructor() {
    super(TABLES.LICENSES);
  }

  // Create new license
  async createLicense(licenseData) {
    const license = {
      id: uuidv4(),
      ...licenseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await this.create(license);
  }

  // Get licenses by asset ID
  async getLicensesByAssetId(assetId, limit = 50) {
    return await this.queryByIndex('AssetIdIndex', 'assetId', assetId, limit);
  }

  // Get licenses by user ID
  async getLicensesByUserId(userId, limit = 50) {
    return await this.queryByIndex('UserIdIndex', 'userId', userId, limit);
  }

  // Update license
  async updateLicense(id, updates) {
    return await this.update(id, updates);
  }

  // Delete license
  async deleteLicense(id) {
    return await this.delete(id);
  }
}

module.exports = new LicenseService();
```

**Verification**:
- [ ] All service files created
- [ ] No syntax errors
- [ ] Proper error handling
- [ ] UUID generation working

#### Task 4.4: Update Authentication Controllers
**Assignee**: Developer 2
**Duration**: 60 minutes

**Update Register Controller** (`server/controllers/auth.controller.js`):

```javascript
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

// BEFORE (MongoDB/Mongoose)
/*
const register = async (req, res) => {
  const { email, password, name } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, name });
  await user.save();
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, email, name } });
};
*/

// AFTER (DynamoDB)
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Create user (service handles duplicate check and hashing)
    const user = await userService.createUser({ email, password, name });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Verify credentials
    const user = await userService.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // req.userId is set by auth middleware
    const user = await userService.getById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { register, login, getCurrentUser };
```

**Update Auth Middleware** (`server/middleware/auth.middleware.js`):

```javascript
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    
    // Optional: Verify user still exists in database
    const user = await userService.getById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

**Verification**:
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] JWT generation correct
- [ ] Password hashing working
- [ ] Auth middleware validates tokens
- [ ] Role-based access working

#### Task 4.5: Update Asset Controllers
**Assignee**: Developer 2
**Duration**: 60 minutes

**Update Asset Controllers** (`server/controllers/assets.controller.js`):

```javascript
const assetService = require('../services/asset.service');

// Create asset
const createAsset = async (req, res) => {
  try {
    const { title, description, category, culturalSignificance } = req.body;
    
    // File info from multer-s3 (uploaded by Developer 1's S3 config)
    const fileUrl = req.file?.location;
    const fileKey = req.file?.key;
    
    if (!fileUrl) {
      return res.status(400).json({ error: 'File upload required' });
    }
    
    const assetData = {
      userId: req.userId, // From auth middleware
      title,
      description,
      category,
      culturalSignificance,
      fileUrl,
      fileKey,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'active'
    };
    
    const asset = await assetService.createAsset(assetData);
    
    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

// Get asset by ID
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await assetService.getById(id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

// Get user's assets
const getUserAssets = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const assets = await assetService.getAssetsByUserId(userId);
    
    res.json(assets);
  } catch (error) {
    console.error('Get user assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// Get all assets (marketplace)
const getAllAssets = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const assets = await assetService.getAllAssets(limit);
    
    // Filter only active assets for public view
    const activeAssets = assets.filter(asset => asset.status === 'active');
    
    res.json(activeAssets);
  } catch (error) {
    console.error('Get all assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

// Update asset
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Verify ownership
    const asset = await assetService.getById(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    if (asset.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this asset' });
    }
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    
    const updatedAsset = await assetService.updateAsset(id, updates);
    
    res.json(updatedAsset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

// Delete asset
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const asset = await assetService.getById(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    if (asset.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this asset' });
    }
    
    // TODO: Also delete file from S3 using asset.fileKey
    
    await assetService.deleteAsset(id);
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

module.exports = {
  createAsset,
  getAssetById,
  getUserAssets,
  getAllAssets,
  updateAsset,
  deleteAsset
};
```

**Verification**:
- [ ] Create asset works with S3 upload
- [ ] Get asset by ID works
- [ ] Get user assets works
- [ ] Update asset works with ownership check
- [ ] Delete asset works with ownership check

#### Task 4.6: Update License Controllers
**Assignee**: Developer 2
**Duration**: 45 minutes

**Update License Controllers** (`server/controllers/licenses.controller.js`):

```javascript
const licenseService = require('../services/license.service');
const assetService = require('../services/asset.service');

// Create license agreement
const createLicense = async (req, res) => {
  try {
    const { assetId, licenseeId, terms, duration, price } = req.body;
    
    // Verify asset exists and user is the owner
    const asset = await assetService.getById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    if (asset.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to license this asset' });
    }
    
    const licenseData = {
      assetId,
      ownerId: req.userId,
      licenseeId,
      terms,
      duration,
      price,
      status: 'pending',
      startDate: new Date().toISOString()
    };
    
    const license = await licenseService.createLicense(licenseData);
    
    res.status(201).json(license);
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({ error: 'Failed to create license' });
  }
};

// Get licenses for an asset
const getAssetLicenses = async (req, res) => {
  try {
    const { assetId } = req.params;
    const licenses = await licenseService.getLicensesByAssetId(assetId);
    
    res.json(licenses);
  } catch (error) {
    console.error('Get asset licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
};

// Get user's licenses (as owner or licensee)
const getUserLicenses = async (req, res) => {
  try {
    const userId = req.userId;
    const licenses = await licenseService.getLicensesByUserId(userId);
    
    res.json(licenses);
  } catch (error) {
    console.error('Get user licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
};

// Update license status
const updateLicenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const license = await licenseService.getById(id);
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    // Only owner or licensee can update
    if (license.ownerId !== req.userId && license.licenseeId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updatedLicense = await licenseService.updateLicense(id, { status });
    
    res.json(updatedLicense);
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({ error: 'Failed to update license' });
  }
};

module.exports = {
  createLicense,
  getAssetLicenses,
  getUserLicenses,
  updateLicenseStatus
};
```

**Verification**:
- [ ] Create license works
- [ ] Get asset licenses works
- [ ] Get user licenses works
- [ ] Update license status works
- [ ] Ownership checks working

#### Task 4.7: Remove MongoDB Configuration
**Assignee**: Developer 2
**Duration**: 20 minutes

**Actions**:
```bash
# Remove MongoDB config file
rm server/config/database.js  # or whatever it's named

# Remove model files
rm -rf server/models/

# Update server.js to remove MongoDB connection
```

**Update server.js**:

```javascript
// REMOVE these lines:
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI);

// Keep everything else (Express setup, routes, etc.)
```

**Verification**:
- [ ] No mongoose imports remain
- [ ] No MongoDB connection code
- [ ] Models directory removed
- [ ] Server starts without MongoDB

#### Task 4.8: Create Data Migration Script
**Assignee**: Developer 2
**Duration**: 90 minutes

**Create script** (`server/scripts/migrate-mongodb-to-dynamodb.js`):

```javascript
const mongoose = require('mongoose');
const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLES } = require("../config/dynamodb.config");
require('dotenv').config();

// Import OLD MongoDB models (temporarily)
// You'll need to keep the models directory just for this migration
const User = require('../models/User');
const Asset = require('../models/Asset');
const License = require('../models/License');

// Helper: Batch write to DynamoDB (max 25 items per batch)
async function batchWrite(tableName, items) {
  const batches = [];
  
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25).map(item => ({
      PutRequest: { Item: item }
    }));
    batches.push(batch);
  }
  
  console.log(`Writing ${items.length} items to ${tableName} in ${batches.length} batches...`);
  
  for (let i = 0; i < batches.length; i++) {
    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: batches[i]
        }
      }));
      console.log(`  Batch ${i + 1}/${batches.length} completed`);
    } catch (error) {
      console.error(`  Batch ${i + 1} failed:`, error);
      throw error;
    }
  }
}

// Migrate Users
async function migrateUsers() {
  console.log('\n=== Migrating Users ===');
  
  const users = await User.find({});
  console.log(`Found ${users.length} users in MongoDB`);
  
  const dynamoUsers = users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    password: user.password, // Already hashed
    name: user.name,
    role: user.role || 'user',
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
  }));
  
  await batchWrite(TABLES.USERS, dynamoUsers);
  console.log('✓ Users migration completed');
}

// Migrate Assets
async function migrateAssets() {
  console.log('\n=== Migrating Assets ===');
  
  const assets = await Asset.find({});
  console.log(`Found ${assets.length} assets in MongoDB`);
  
  const dynamoAssets = assets.map(asset => ({
    id: asset._id.toString(),
    userId: asset.userId?.toString() || asset.owner?.toString(),
    title: asset.title,
    description: asset.description,
    category: asset.category,
    culturalSignificance: asset.culturalSignificance,
    fileUrl: asset.fileUrl || asset.filePath, // Handle both field names
    fileKey: asset.fileKey || '',
    fileSize: asset.fileSize || 0,
    mimeType: asset.mimeType || 'application/octet-stream',
    status: asset.status || 'active',
    createdAt: asset.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: asset.updatedAt?.toISOString() || new Date().toISOString()
  }));
  
  await batchWrite(TABLES.ASSETS, dynamoAssets);
  console.log('✓ Assets migration completed');
}

// Migrate Licenses
async function migrateLicenses() {
  console.log('\n=== Migrating Licenses ===');
  
  const licenses = await License.find({});
  console.log(`Found ${licenses.length} licenses in MongoDB`);
  
  const dynamoLicenses = licenses.map(license => ({
    id: license._id.toString(),
    assetId: license.assetId?.toString(),
    ownerId: license.ownerId?.toString(),
    licenseeId: license.licenseeId?.toString(),
    terms: license.terms,
    duration: license.duration,
    price: license.price,
    status: license.status || 'pending',
    startDate: license.startDate?.toISOString() || new Date().toISOString(),
    createdAt: license.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: license.updatedAt?.toISOString() || new Date().toISOString()
  }));
  
  await batchWrite(TABLES.LICENSES, dynamoLicenses);
  console.log('✓ Licenses migration completed');
}

// Main migration function
async function runMigration() {
  try {
    console.log('Starting MongoDB to DynamoDB migration...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('AWS Region:', process.env.AWS_REGION);
    console.log('DynamoDB Tables:', TABLES);
    
    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Run migrations
    await migrateUsers();
    await migrateAssets();
    await migrateLicenses();
    
    console.log('\n=== Migration Completed Successfully! ===');
    console.log('Please verify data in DynamoDB Console');
    
  } catch (error) {
    console.error('\n=== Migration Failed ===');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
runMigration();
```

**Create backup script** (`server/scripts/backup-mongodb.js`):
```javascript
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const User = require('../models/User');
const Asset = require('../models/Asset');
const License = require('../models/License');

async function backupMongoDB() {
  try {
    console.log('Creating MongoDB backup...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = await User.find({}).lean();
    const assets = await Asset.find({}).lean();
    const licenses = await License.find({}).lean();
    
    const backup = {
      timestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        assets: assets.length,
        licenses: licenses.length
      },
      data: {
        users,
        assets,
        licenses
      }
    };
    
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const filename = `mongodb-backup-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    console.log(`✓ Backup created: ${filepath}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Assets: ${assets.length}`);
    console.log(`  Licenses: ${licenses.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupMongoDB();
```

**Verification**:
- [ ] Migration script created
- [ ] Backup script created
- [ ] No syntax errors
- [ ] Dependencies available

#### Task 4.9: Test Migration Script
**Assignee**: Developer 2
**Duration**: 30 minutes

**Actions**:
```bash
# First, create a backup
node server/scripts/backup-mongodb.js

# Review backup file
ls -lh server/backups/
cat server/backups/mongodb-backup-*.json | jq '.counts'

# Run migration (DRY RUN first - add a flag to test without writing)
# Uncomment this after testing: node server/scripts/migrate-mongodb-to-dynamodb.js

# Verify in DynamoDB Console
aws dynamodb describe-table --table-name UsersTable --region ap-south-1
aws dynamodb scan --table-name UsersTable --region ap-south-1 --max-items 5

# Count items
aws dynamodb scan --table-name UsersTable --select COUNT --region ap-south-1
aws dynamodb scan --table-name AssetsTable --select COUNT --region ap-south-1
aws dynamodb scan --table-name LicensesTable --select COUNT --region ap-south-1
```

**Verification**:
- [ ] Backup created successfully
- [ ] Backup file readable
- [ ] Item counts match MongoDB
- [ ] Data structure correct in DynamoDB
- [ ] GSIs populated correctly

#### Task 4.10: Commit Database Changes
**Assignee**: Developer 2
**Duration**: 15 minutes

**Actions**:
```bash
# Stage changes
git add server/config/dynamodb.config.js
git add server/services/
git add server/controllers/
git add server/middleware/
git add server/scripts/
git add package.json package-lock.json

# Remove MongoDB artifacts
git rm server/config/database.js
git rm -r server/models/

# Commit with descriptive message
git commit -m "feat: migrate database from MongoDB to DynamoDB

- Add DynamoDB configuration and document client
- Create service layer for Users, Assets, and Licenses
- Update all controllers to use DynamoDB services
- Implement authentication with email GSI
- Add data migration script from MongoDB
- Remove Mongoose models and MongoDB connection
- Add MongoDB backup script for safety"

# Push to remote
git push origin feature/aws-migration
```

**Verification**:
- [ ] Changes committed
- [ ] Commit message descriptive
- [ ] Pushed to correct branch
- [ ] No sensitive data in commit

---

### PHASE 5: Integration & Testing (Priority: HIGH)

#### Task 5.1: Merge Both Streams
**Assignee**: BOTH developers
**Duration**: 30 minutes

**Developer 1 Actions**:
```bash
# Pull Developer 2's changes
git pull origin feature/aws-migration

# Resolve any conflicts if they arise
# Most likely conflicts will be in package.json or .env.example

# Test that everything still works together
npm install
npm start
```

**Developer 2 Actions**:
```bash
# Pull Developer 1's changes
git pull origin feature/aws-migration

# Resolve conflicts if any
# Test integration
npm install
npm start
```

**Common Conflicts to Expect**:
- `package.json`: Merge dependencies from both
- `server/routes/assets.routes.js`: Should have S3 upload + DynamoDB save
- `.env.example`: Should have both AWS and DynamoDB variables

**Verification**:
- [ ] All conflicts resolved
- [ ] Both developers can run server locally
- [ ] No compilation errors
- [ ] All dependencies installed

#### Task 5.2: End-to-End Testing
**Assignee**: BOTH developers
**Duration**: 60 minutes

**Test Suite**:

**Test 1: User Registration**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Expected: 201 Created with token and user object
```

**Test 2: User Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Save the token from response
TOKEN="<token_from_response>"
```

**Test 3: Get Current User**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: User object without password
```

**Test 4: Upload Asset**
```bash
curl -X POST http://localhost:5000/api/assets/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-image.jpg" \
  -F "title=Test Asset" \
  -F "description=Test Description" \
  -F "category=Photography"

# Expected: Asset object with S3 URL
# Save asset ID from response
ASSET_ID="<asset_id_from_response>"
```

**Test 5: Get Asset by ID**
```bash
curl -X GET http://localhost:5000/api/assets/$ASSET_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: Full asset object
```

**Test 6: Get User's Assets**
```bash
curl -X GET http://localhost:5000/api/assets/my-assets \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array with uploaded asset
```

**Test 7: Get All Assets (Marketplace)**
```bash
curl -X GET http://localhost:5000/api/assets

# Expected: Array of all active assets (no auth required)
```

**Test 8: Create License**
```bash
curl -X POST http://localhost:5000/api/licenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "'$ASSET_ID'",
    "licenseeId": "another-user-id",
    "terms": "Non-commercial use only",
    "duration": 365,
    "price": 99.99
  }'

# Expected: License object
```

**Test 9: Verify S3 File**
```bash
# Check that file exists in S3
aws s3 ls s3://dharohar-assets-bucket/uploads/ --recursive

# Try accessing the S3 URL from Test 4
curl -I "<s3_url_from_test_4>"
# Expected: 200 OK or 403 Forbidden (depending on bucket policy)
```

**Test 10: Verify DynamoDB Data**
```bash
# Check user in DynamoDB
aws dynamodb query \
  --table-name UsersTable \
  --index-name EmailIndex \
  --key-condition-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"test@example.com"}}' \
  --region ap-south-1

# Check asset in DynamoDB
aws dynamodb get-item \
  --table-name AssetsTable \
  --key '{"id":{"S":"'$ASSET_ID'"}}' \
  --region ap-south-1
```

**Create Test Checklist** (`server/tests/migration-test-checklist.md`):
```markdown
# Migration Test Checklist

## Authentication
- [ ] User registration works
- [ ] Duplicate email check works
- [ ] User login works
- [ ] Invalid credentials rejected
- [ ] JWT token generated correctly
- [ ] Token validation works
- [ ] Get current user works

## Assets
- [ ] File upload to S3 works
- [ ] Asset creation in DynamoDB works
- [ ] Asset stored with correct metadata
- [ ] Get asset by ID works
- [ ] Get user's assets works (filtered by userId)
- [ ] Get all assets works (marketplace view)
- [ ] Update asset works (with ownership check)
- [ ] Delete asset works (with ownership check)
- [ ] File size limits enforced
- [ ] File type validation works

## Licenses
- [ ] Create license works
- [ ] Get licenses by asset ID works
- [ ] Get licenses by user ID works
- [ ] Update license status works
- [ ] Ownership checks work

## Integration
- [ ] Create user → upload asset → view asset flow works
- [ ] Multiple users can interact with same assets
- [ ] S3 URLs in database are accessible
- [ ] GSIs return correct results
- [ ] Timestamps (createdAt, updatedAt) working

## Performance
- [ ] API responses under 500ms
- [ ] Batch operations complete successfully
- [ ] No memory leaks during testing
- [ ] Concurrent requests handled properly

## Security
- [ ] No AWS credentials in code
- [ ] JWT secrets not exposed
- [ ] File uploads sanitized
- [ ] SQL injection not possible (N/A for NoSQL)
- [ ] XSS prevention in place
- [ ] CORS configured correctly

## Error Handling
- [ ] Invalid tokens return 401
- [ ] Missing auth returns 401
- [ ] Not found returns 404
- [ ] Forbidden access returns 403
- [ ] Server errors return 500
- [ ] Error messages are user-friendly
- [ ] Errors logged properly
```

**Verification**:
- [ ] All 10 curl tests pass
- [ ] Test checklist completed
- [ ] No errors in server logs
- [ ] Data visible in AWS console
- [ ] Frontend can interact with API

#### Task 5.3: Update Environment Variables
**Assignee**: BOTH developers
**Duration**: 15 minutes

**Create `.env.example`** (for documentation):
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_here_min_32_chars

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1

# DynamoDB Tables
DYNAMODB_USERS_TABLE=UsersTable
DYNAMODB_ASSETS_TABLE=AssetsTable
DYNAMODB_LICENSES_TABLE=LicensesTable

# S3 Buckets
S3_BUCKET_NAME=dharohar-assets-bucket
S3_RAW_UPLOADS_BUCKET=dharohar-raw-uploads
S3_PROCESSED_BUCKET=dharohar-processed-uploads

# CORS (Frontend URL)
FRONTEND_URL=http://localhost:3000

# REMOVE these (MongoDB no longer needed):
# MONGODB_URI=mongodb://localhost:27017/dharohar
```

**Update `.gitignore`**:
```bash
# Add if not present
echo ".env" >> .gitignore
echo "server/backups/" >> .gitignore
echo "server/uploads/" >> .gitignore
echo "migration-log.txt" >> .gitignore
```

**Commit**:
```bash
git add .env.example .gitignore
git commit -m "docs: add environment variable documentation"
git push origin feature/aws-migration
```

**Verification**:
- [ ] `.env.example` exists
- [ ] No actual credentials in `.env.example`
- [ ] `.gitignore` updated
- [ ] `.env` still in `.gitignore`

#### Task 5.4: Update Documentation
**Assignee**: Developer 1
**Duration**: 30 minutes

**Update `QUICKSTART.md`**:
Add new section for AWS setup:

```markdown
## AWS Configuration

### 1. Install AWS CLI
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: ap-south-1
# Default output format: json
```

### 3. Verify AWS Setup
```bash
aws sts get-caller-identity
aws dynamodb list-tables --region ap-south-1
aws s3 ls
```

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp server/.env.example server/.env
nano server/.env  # Edit with your values
```

### 5. Run Data Migration (One-time)
If migrating from existing MongoDB:
```bash
# Create backup first
node server/scripts/backup-mongodb.js

# Run migration
node server/scripts/migrate-mongodb-to-dynamodb.js
```

### 6. Start the Server
```bash
cd server
npm install
npm start
```
```

**Create `MIGRATION_SUMMARY.md`**:
```markdown
# AWS Migration Summary

## What Changed

### Database: MongoDB → DynamoDB
- **Before**: Mongoose models with flexible schemas
- **After**: DynamoDB tables with primary keys and GSIs
- **Tables**: UsersTable, AssetsTable, LicensesTable
- **Key Design**: Single partition key (id) + GSIs for queries

### File Storage: Local → S3
- **Before**: Files stored in `server/uploads/`
- **After**: Files stored in S3 buckets
- **Buckets**: 
  - `dharohar-assets-bucket` (main storage)
  - `dharohar-raw-uploads` (unprocessed)
  - `dharohar-processed-uploads` (processed media)

### Authentication: Updated
- **Before**: MongoDB User.findOne({ email })
- **After**: DynamoDB query on EmailIndex GSI
- **Security**: Passwords still hashed with bcrypt, JWTs unchanged

## Breaking Changes

### API Response Format
Asset objects now include:
- `fileUrl` (S3 URL) instead of `filePath`
- `fileKey` (S3 key for deletion)
- `id` (UUID) instead of `_id` (ObjectId)

### Query Patterns
- Can't do arbitrary queries (no $regex, $or, etc.)
- Must use primary keys or GSIs
- Pagination uses LastEvaluatedKey instead of skip/limit

## Migration Checklist

- [x] AWS IAM users created
- [x] DynamoDB tables provisioned
- [x] S3 buckets created
- [x] Backend code migrated
- [x] Data migration completed
- [x] Testing completed
- [ ] Production deployment
- [ ] Frontend updated (if needed)
- [ ] Old MongoDB decommissioned

## Rollback Plan

If migration fails:
1. Keep MongoDB backup (in `server/backups/`)
2. Revert to `main` branch: `git checkout main`
3. Restore MongoDB data if needed
4. Delete DynamoDB tables to stop charges

## Next Steps

1. Deploy to EC2 (see `db_migration.md` Phase 4)
2. Set up Lambda for FFmpeg processing
3. Configure CloudWatch monitoring
4. Set up automated backups
5. Implement caching (ElastiCache/DynamoDB DAX)
```

**Verification**:
- [ ] `QUICKSTART.md` updated
- [ ] `MIGRATION_SUMMARY.md` created
- [ ] Documentation clear and accurate
- [ ] Committed to repository

---

### PHASE 6: Deployment Preparation (Priority: MEDIUM)

#### Task 6.1: Merge to Main Branch
**Assignee**: BOTH developers (coordinate)
**Duration**: 30 minutes

**Actions**:
```bash
# Developer 1 creates PR
git checkout feature/aws-migration
git pull origin feature/aws-migration
git push origin feature/aws-migration

# Create Pull Request on GitHub
# Title: "AWS Migration: MongoDB→DynamoDB, Local→S3"
# Description: Link to MIGRATION_SUMMARY.md
```

**PR Review Checklist**:
- [ ] All tests passing
- [ ] No merge conflicts with main
- [ ] Documentation updated
- [ ] No hardcoded credentials
- [ ] `.env.example` present
- [ ] Migration scripts tested

**Merge PR**:
```bash
# After review and approval
git checkout main
git pull origin main
git merge feature/aws-migration
git push origin main
```

**Verification**:
- [ ] PR created
- [ ] Code reviewed
- [ ] Tests pass in CI (if set up)
- [ ] Merged to main
- [ ] Migration branch retained for reference

#### Task 6.2: Tag Release
**Assignee**: Developer 1
**Duration**: 10 minutes

**Actions**:
```bash
git checkout main
git pull origin main

# Create annotated tag
git tag -a v2.0.0-aws-migration -m "AWS Migration Release

- Migrated from MongoDB to DynamoDB
- Migrated from local storage to S3
- Updated authentication system
- Added data migration scripts
- Updated documentation"

# Push tag
git push origin v2.0.0-aws-migration

# Verify
git tag -l
```

**Verification**:
- [ ] Tag created
- [ ] Tag pushed to remote
- [ ] Tag visible on GitHub

---

### PHASE 7: Production Deployment (Priority: HIGH)

#### Task 7.1: Provision EC2 Instance
**Assignee**: Developer 2
**Duration**: 45 minutes

**Actions in AWS Console**:
1. EC2 → Launch Instance
2. Configuration:
   ```
   Name: dharohar-production
   AMI: Ubuntu Server 22.04 LTS
   Instance type: t2.small (or t3.small for better performance)
   Key pair: Create new → Download .pem file (SAVE THIS!)
   
   Network settings:
   - VPC: Default
   - Auto-assign public IP: Enable
   - Security group: Create new
     - SSH (22): Your IP
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom TCP (5000): 0.0.0.0/0 (temporary, remove after Nginx setup)
   
   Storage: 20 GB gp3
   ```
3. Launch instance
4. Wait for instance state: "Running"
5. Note down Public IP address

**Set File Permissions** (local):
```bash
chmod 400 ~/Downloads/dharohar-production.pem
```

**Verification**:
- [ ] EC2 instance running
- [ ] Public IP assigned
- [ ] Security group configured
- [ ] Key pair downloaded and secured

#### Task 7.2: Initial Server Setup
**Assignee**: Developer 2
**Duration**: 60 minutes

**SSH into server**:
```bash
ssh -i ~/Downloads/dharohar-production.pem ubuntu@<EC2_PUBLIC_IP>
```

**Update system**:
```bash
sudo apt update
sudo apt upgrade -y
```

**Install Node.js 20**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version
```

**Install Git**:
```bash
sudo apt-get install -y git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

**Install PM2** (Process Manager):
```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

**Install Nginx**:
```bash
sudo apt-get install -y nginx

# Verify
sudo systemctl status nginx
```

**Verification**:
- [ ] SSH access working
- [ ] Node.js 20 installed
- [ ] Git installed
- [ ] PM2 installed
- [ ] Nginx running

#### Task 7.3: Clone and Setup Application
**Assignee**: Developer 2
**Duration**: 30 minutes

**Clone repository**:
```bash
cd ~
git clone https://github.com/your-username/dharohar.git
cd dharohar
git checkout main  # Or specific tag: v2.0.0-aws-migration
```

**Install dependencies**:
```bash
cd server
npm install --production
```

**Create production .env**:
```bash
nano .env
```

**Add production environment variables**:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT (Generate strong secret)
JWT_SECRET=<GENERATE_STRONG_32_CHAR_SECRET>

# AWS Credentials (use IAM user keys)
AWS_ACCESS_KEY_ID=<YOUR_PRODUCTION_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_PRODUCTION_SECRET_KEY>
AWS_REGION=ap-south-1

# DynamoDB Tables (production names)
DYNAMODB_USERS_TABLE=UsersTable-Prod
DYNAMODB_ASSETS_TABLE=AssetsTable-Prod
DYNAMODB_LICENSES_TABLE=LicensesTable-Prod

# S3 Buckets (production buckets)
S3_BUCKET_NAME=dharohar-assets-prod
S3_RAW_UPLOADS_BUCKET=dharohar-raw-uploads-prod
S3_PROCESSED_BUCKET=dharohar-processed-uploads-prod

# CORS
FRONTEND_URL=https://your-domain.com
```

**Generate strong JWT secret**:
```bash
# Generate 32-char random string
openssl rand -base64 32
```

**Test server**:
```bash
npm start

# In another terminal/tab
curl http://localhost:5000/api/health
# Expected: { "status": "ok" }

# Stop server (Ctrl+C)
```

**Verification**:
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] `.env` file created with production values
- [ ] Server starts without errors
- [ ] Health check endpoint works

#### Task 7.4: Configure PM2
**Assignee**: Developer 2
**Duration**: 20 minutes

**Create PM2 ecosystem file**:
```bash
cd ~/dharohar/server
nano ecosystem.config.js
```

**Ecosystem configuration**:
```javascript
module.exports = {
  apps: [{
    name: 'dharohar-api',
    script: './server.js',
    instances: 2,  // Use 2 CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

**Create logs directory**:
```bash
mkdir -p ~/dharohar/server/logs
```

**Start with PM2**:
```bash
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Save PM2 config
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs
```

**Verification**:
- [ ] PM2 ecosystem file created
- [ ] Application running in cluster mode
- [ ] PM2 status shows "online"
- [ ] Logs directory created
- [ ] PM2 configured to start on boot

#### Task 7.5: Configure Nginx Reverse Proxy
**Assignee**: Developer 2
**Duration**: 30 minutes

**Create Nginx configuration**:
```bash
sudo nano /etc/nginx/sites-available/dharohar
```

**Nginx config**:
```nginx
# Upstream configuration
upstream dharohar_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with actual domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Logging
    access_log /var/log/nginx/dharohar.access.log;
    error_log /var/log/nginx/dharohar.error.log;
    
    # API endpoints
    location /api {
        proxy_pass http://dharohar_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Disable cache
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://dharohar_backend;
        access_log off;
    }
    
    # File upload size limit
    client_max_body_size 50M;
}
```

**Enable site**:
```bash
# Test configuration
sudo nginx -t

# Create symlink
sudo ln -s /etc/nginx/sites-available/dharohar /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

**Verification**:
- [ ] Nginx config created
- [ ] No syntax errors (nginx -t)
- [ ] Site enabled
- [ ] Nginx restarted successfully
- [ ] Can access API through Nginx

**Test from local machine**:
```bash
curl http://<EC2_PUBLIC_IP>/api/health
# Expected: { "status": "ok" }
```

#### Task 7.6: Setup SSL with Let's Encrypt
**Assignee**: Developer 2
**Duration**: 30 minutes

**Prerequisites**:
- Domain name pointing to EC2 public IP
- DNS propagated (check with `nslookup your-domain.com`)

**Install Certbot**:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

**Obtain SSL certificate**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

**Test auto-renewal**:
```bash
sudo certbot renew --dry-run
```

**Verification**:
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured
- [ ] SSL Labs test shows A+ rating

**Test HTTPS**:
```bash
curl https://your-domain.com/api/health
```

#### Task 7.7: Configure Firewall
**Assignee**: Developer 2
**Duration**: 15 minutes

**Setup UFW**:
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

**Update EC2 Security Group**:
- Remove port 5000 rule (no longer needed with Nginx)
- Keep only: 22 (SSH), 80 (HTTP), 443 (HTTPS)

**Verification**:
- [ ] UFW enabled and configured
- [ ] Only necessary ports open
- [ ] EC2 security group updated
- [ ] Application still accessible via HTTPS

#### Task 7.8: Production Data Migration
**Assignee**: Developer 2
**Duration**: 45 minutes

**Create production DynamoDB tables** (if not already created):
```bash
# Run these from local machine with AWS CLI

# UsersTable-Prod
aws dynamodb create-table \
  --table-name UsersTable-Prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region ap-south-1

# AssetsTable-Prod
aws dynamodb create-table \
  --table-name AssetsTable-Prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"UserIdIndex\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region ap-south-1

# LicensesTable-Prod
aws dynamodb create-table \
  --table-name LicensesTable-Prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=assetId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"AssetIdIndex\",\"KeySchema\":[{\"AttributeName\":\"assetId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"UserIdIndex\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region ap-south-1
```

**Create production S3 buckets**:
```bash
aws s3 mb s3://dharohar-assets-prod --region ap-south-1
aws s3 mb s3://dharohar-raw-uploads-prod --region ap-south-1
aws s3 mb s3://dharohar-processed-uploads-prod --region ap-south-1

# Configure CORS
aws s3api put-bucket-cors \
  --bucket dharohar-assets-prod \
  --cors-configuration file://cors-config.json \
  --region ap-south-1
```

**Run production migration** (from EC2):
```bash
cd ~/dharohar/server

# If you have production MongoDB data
node scripts/migrate-mongodb-to-dynamodb.js

# Otherwise, tables are ready for new data
```

**Verification**:
- [ ] Production DynamoDB tables created
- [ ] All GSIs in "Active" state
- [ ] Production S3 buckets created
- [ ] Data migrated (if applicable)
- [ ] Tables accessible from EC2

#### Task 7.9: Monitoring Setup
**Assignee**: Developer 2
**Duration**: 30 minutes

**Install CloudWatch agent** (optional but recommended):
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

**Setup PM2 monitoring**:
```bash
# PM2 Plus (free tier)
pm2 link <secret_key> <public_key>  # Sign up at pm2.io first

# Or use built-in monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Create health check script**:
```bash
nano ~/health-check.sh
```

**Health check script**:
```bash
#!/bin/bash

ENDPOINT="http://localhost:5000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Health check passed"
else
    echo "$(date): Health check failed (Status: $RESPONSE)"
    # Restart application
    cd ~/dharohar/server
    pm2 restart dharohar-api
fi
```

**Make executable and schedule**:
```bash
chmod +x ~/health-check.sh

# Add to crontab (run every 5 minutes)
crontab -e
# Add line:
*/5 * * * * ~/health-check.sh >> ~/health-check.log 2>&1
```

**Verification**:
- [ ] PM2 monitoring configured
- [ ] Log rotation enabled
- [ ] Health check script created
- [ ] Cron job scheduled
- [ ] Logs being written

---

### PHASE 8: Post-Deployment (Priority: LOW)

#### Task 8.1: Frontend Configuration
**Assignee**: Developer 1
**Duration**: 30 minutes

**Update frontend API endpoint**:
```bash
# In frontend/.env or equivalent
VITE_API_URL=https://your-domain.com/api
```

**Update frontend code** (if using hardcoded URLs):
```javascript
// frontend/src/services/api.js (or equivalent)

// BEFORE
const API_BASE_URL = 'http://localhost:5000/api';

// AFTER
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Rebuild and deploy frontend**:
```bash
cd frontend
npm run build

# Deploy to hosting (Vercel, Netlify, S3+CloudFront, etc.)
```

**Verification**:
- [ ] Frontend points to production API
- [ ] CORS working
- [ ] Authentication working
- [ ] File uploads working
- [ ] All features functional

#### Task 8.2: Performance Testing
**Assignee**: BOTH developers
**Duration**: 45 minutes

**Load testing with Apache Bench**:
```bash
# Install on local machine
sudo apt-get install apache2-utils  # Linux
brew install ab  # macOS

# Test health endpoint
ab -n 1000 -c 10 https://your-domain.com/api/health

# Test authenticated endpoint (need to get token first)
TOKEN="your_jwt_token"
ab -n 100 -c 5 -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/assets
```

**Monitor during load test**:
```bash
# On EC2 server
pm2 monit

# Watch logs
pm2 logs --lines 100

# System resources
htop  # Install with: sudo apt-get install htop
```

**Check DynamoDB metrics**:
- AWS Console → DynamoDB → Tables → Metrics
- Monitor read/write capacity usage
- Check for throttled requests

**Check S3 metrics**:
- AWS Console → S3 → Metrics
- Monitor GET/PUT requests
- Check bandwidth usage

**Verification**:
- [ ] API handles 100+ concurrent requests
- [ ] Response times under 500ms
- [ ] No throttling errors
- [ ] No memory leaks
- [ ] CPU usage acceptable

#### Task 8.3: Backup Strategy
**Assignee**: Developer 2
**Duration**: 30 minutes

**Enable DynamoDB Point-in-Time Recovery**:
```bash
aws dynamodb update-continuous-backups \
  --table-name UsersTable-Prod \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region ap-south-1

# Repeat for other tables
```

**Enable S3 Versioning**:
```bash
aws s3api put-bucket-versioning \
  --bucket dharohar-assets-prod \
  --versioning-configuration Status=Enabled \
  --region ap-south-1
```

**Create EC2 AMI Backup**:
```bash
# From AWS Console or CLI
aws ec2 create-image \
  --instance-id i-xxxxx \
  --name "dharohar-backup-$(date +%Y%m%d)" \
  --description "Production backup" \
  --region ap-south-1
```

**Schedule automated backups**:
```bash
# Create backup script on EC2
nano ~/backup.sh
```

**Backup script**:
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application code
cd ~/dharohar
git pull origin main
tar -czf $BACKUP_DIR/code-$DATE.tar.gz ~/dharohar

# Backup logs
tar -czf $BACKUP_DIR/logs-$DATE.tar.gz ~/dharohar/server/logs

# Upload to S3
aws s3 cp $BACKUP_DIR/code-$DATE.tar.gz s3://dharohar-backups/code/ --region ap-south-1
aws s3 cp $BACKUP_DIR/logs-$DATE.tar.gz s3://dharohar-backups/logs/ --region ap-south-1

# Clean local backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Schedule backup**:
```bash
chmod +x ~/backup.sh
crontab -e
# Add: 0 2 * * * ~/backup.sh >> ~/backup.log 2>&1
```

**Verification**:
- [ ] DynamoDB PITR enabled
- [ ] S3 versioning enabled
- [ ] AMI created
- [ ] Backup script scheduled
- [ ] Test restore procedure documented

#### Task 8.4: Documentation Finalization
**Assignee**: Developer 1
**Duration**: 45 minutes

**Create `PRODUCTION_RUNBOOK.md`**:
```markdown
# Production Runbook

## Server Access
```bash
ssh -i ~/path/to/dharohar-production.pem ubuntu@<EC2_IP>
```

## Application Management

### View Status
```bash
pm2 status
pm2 logs dharohar-api --lines 50
```

### Restart Application
```bash
pm2 restart dharohar-api
```

### Deploy New Version
```bash
cd ~/dharohar
git pull origin main
cd server
npm install --production
pm2 restart dharohar-api
```

### View System Resources
```bash
htop
df -h  # Disk space
free -h  # Memory
```

## Nginx Management

### Test Configuration
```bash
sudo nginx -t
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### View Logs
```bash
sudo tail -f /var/log/nginx/dharohar.error.log
sudo tail -f /var/log/nginx/dharohar.access.log
```

## SSL Certificate Renewal
```bash
sudo certbot renew
sudo systemctl restart nginx
```

## Database Operations

### Query DynamoDB
```bash
# Get item
aws dynamodb get-item \
  --table-name UsersTable-Prod \
  --key '{"id":{"S":"user-id-here"}}' \
  --region ap-south-1

# Count items
aws dynamodb scan \
  --table-name UsersTable-Prod \
  --select COUNT \
  --region ap-south-1
```

## Troubleshooting

### Application Not Responding
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs`
3. Check disk space: `df -h`
4. Restart: `pm2 restart dharohar-api`

### High Memory Usage
1. Check processes: `htop`
2. Check PM2 config: `cat ~/dharohar/server/ecosystem.config.js`
3. Restart with memory limit: `pm2 restart dharohar-api --max-memory-restart 500M`

### Database Connection Issues
1. Check AWS credentials: `aws sts get-caller-identity`
2. Check .env file: `cat ~/dharohar/server/.env`
3. Test DynamoDB access: `aws dynamodb list-tables --region ap-south-1`

### SSL Certificate Issues
1. Check certificate status: `sudo certbot certificates`
2. Renew manually: `sudo certbot renew --force-renewal`
3. Restart Nginx: `sudo systemctl restart nginx`

## Monitoring

### Check Application Health
```bash
curl https://your-domain.com/api/health
```

### AWS Console Monitoring
- CloudWatch: Application logs and metrics
- DynamoDB: Table metrics and capacity
- S3: Storage and bandwidth usage
- EC2: Instance metrics

## Emergency Contacts
- Developer 1: [email/phone]
- Developer 2: [email/phone]
- AWS Support: [account details]
```

**Update `README.md`**:
```markdown
# Dharohar - Cultural Heritage Platform

## Architecture (Post-Migration)

- **Backend**: Node.js/Express on AWS EC2
- **Database**: AWS DynamoDB
- **File Storage**: AWS S3
- **Authentication**: JWT with bcrypt
- **Deployment**: PM2 + Nginx + Let's Encrypt

## Links
- Production: https://your-domain.com
- Documentation: See `/documentation` folder
- Migration Guide: `db_migration.md`
- Runbook: `PRODUCTION_RUNBOOK.md`

## Quick Start
See `QUICKSTART.md` for setup instructions.
```

**Verification**:
- [ ] Runbook complete and tested
- [ ] README updated
- [ ] All documentation links working
- [ ] Emergency contacts added

#### Task 8.5: Decommission MongoDB
**Assignee**: Developer 1
**Duration**: 20 minutes

**WARNING**: Only do this after confirming production is stable for 1-2 weeks!

**Actions**:
```bash
# Stop MongoDB locally
sudo systemctl stop mongod

# Disable MongoDB from starting on boot
sudo systemctl disable mongod

# Optional: Uninstall MongoDB
# sudo apt-get remove mongodb-org
# sudo apt-get purge mongodb-org

# Keep backups for 30 days before deleting
# Don't delete until absolutely sure!
```

**Archive MongoDB backups**:
```bash
# Compress all MongoDB backups
tar -czf mongodb-archives-$(date +%Y%m%d).tar.gz ~/dharohar/server/backups/

# Upload to S3 for long-term storage
aws s3 cp mongodb-archives-*.tar.gz s3://dharohar-backups/mongodb-archives/ --region ap-south-1

# Keep local copy for 30 days
```

**Verification**:
- [ ] Production stable for 2+ weeks
- [ ] All data verified in DynamoDB
- [ ] Backups archived to S3
- [ ] MongoDB stopped (not removed yet)
- [ ] Team aware of decommission

---

## 🚀 EXECUTION TIMELINE

### Week 1: Preparation & Setup
- **Day 1**: Phase 1 (AWS account, IAM, branching)
- **Day 2**: Phase 2 (DynamoDB tables, S3 buckets)
- **Day 3-4**: Phase 3 (File storage migration)
- **Day 5**: Phase 4 (Database migration)

### Week 2: Testing & Deployment
- **Day 1-2**: Phase 5 (Integration testing)
- **Day 3**: Phase 6 (Deployment prep, merge to main)
- **Day 4-5**: Phase 7 (Production deployment)

### Week 3: Post-Deployment
- **Day 1**: Phase 8 (Frontend, testing, monitoring)
- **Day 2-7**: Monitor production, fix issues

### Week 5: Cleanup
- **Day 1**: Decommission MongoDB (after 2 weeks stable)

---

## ✅ SUCCESS CRITERIA

Migration is complete when:
- [ ] All users can register and login
- [ ] All file uploads go to S3
- [ ] All database operations use DynamoDB
- [ ] Production API responding under 500ms
- [ ] No MongoDB dependencies in code
- [ ] All data migrated successfully
- [ ] Frontend working with new backend
- [ ] Monitoring and alerts configured
- [ ] Documentation complete
- [ ] Team trained on new architecture

---

## 🔄 ROLLBACK PROCEDURE

If critical issues arise:

1. **Immediate**: Point frontend to old MongoDB server
2. **Short-term**: Revert git branch to pre-migration
3. **Long-term**: Restore from MongoDB backup

**Rollback command**:
```bash
git checkout main
git revert <migration-commit-hash>
# Update .env to use MongoDB
# Restart server
```

---

## 📞 SUPPORT & ESCALATION

**Communication Channels**:
- Daily standups: 10 AM (sync on progress)
- Slack channel: #aws-migration
- Emergency contact: [phone numbers]

**Escalation Path**:
1. Try troubleshooting steps in runbook
2. Check AWS documentation
3. Contact team member
4. Reach out to AWS support (if needed)

---

## 📚 ADDITIONAL RESOURCES

- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/best-practices.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

---

END OF GUIDE
