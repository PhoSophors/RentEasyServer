# RentEasyServer

## How to run this RentEasy Server?

step 1: clode project (open terminal and run this command): 
```dash
git clone https://github.com/PhoSophors/RentEasyServer.git
```

step 2: open project in terminal or IDE:
```dash
cd RentEasyServer
```
step 3: Install dependencies:
```dash
npm install
```
step 4: setup enviroment:
  1. step 4.1: copy `example.env` rename to `.env`
  2. step 4.2: `.env` follow:

 ```markdown
  # MondoDB
  MONGO_URI=your_mongo_uri_here

  # JTW
  JWT_SECRET=your_jwt_secret_here
  JWT_REFRESH_SECRET: your_jwt_refresh_secret_here

  # Google account for nodemailler
  EMAIL_USER: your_email_here
  EMAIL_PASS: your_email_password_here

  # Amazon S3 Cloud Storage
  AWS_ACCESS_KEY_ID: your_aws_access_key_id_here
  AWS_SECRET_ACCESS_KEY: your_aws_secret_access_key_here
  AWS_REGION: your_aws_region_here
  AWS_S3_BUCKET_NAME: your_aws_s3_bucket_name_here
  ```

step 5: setup Amazon S3 permission: 
  1. step 5.1: set Block all public access to `off`
  2. step 5.2: Here is `Bucket policy` follow: 

  ```dash
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowUploadWithACL",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::iam_user_id:root"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::your_bucket_name/*",
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": "public-read"
                }
            }
        },
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your_bucket_name/*"
        },
        {
            "Sid": "AllowUpdateObject",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::iam_user_id:root"
            },
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your_bucket_name/*"
        },
        {
            "Sid": "AllowDeleteObject",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::iam_user_id:root"
            },
            "Action": "s3:DeleteObject",
            "Resource": "arn:aws:s3:::your_bucket_name/*"
        }
    ]
  }
  ```

step 6: run `RentEasyServer`
```dash
npm run dev
```
