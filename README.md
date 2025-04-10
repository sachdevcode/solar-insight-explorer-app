# Solar Insight Explorer

A comprehensive web application that helps users analyze solar proposals and utility bills to provide detailed insights into solar energy production, cost savings, and incentives.

## Overview

Solar Insight Explorer is a full-stack application designed to simplify the process of evaluating solar energy proposals. It extracts key data from solar sales proposals and utility bills, calculates potential savings, and provides detailed analytics on solar production, financial benefits, and available incentives.

## Features

### Document Analysis
- **Solar Proposal Parsing**: Automatically extracts key information from PDF solar proposals including system size, panel details, production estimates, and pricing
- **Utility Bill Processing**: Parses utility bills to determine current energy usage and costs

### Data Analysis
- **Solar Production Estimates**: Integrates with the PVWatts API to calculate accurate solar production estimates based on system specifications and location
- **Solar Potential Assessment**: Uses Google Sunroof API to determine the solar potential for specific roof configurations
- **SREC and Incentive Calculation**: Estimates Solar Renewable Energy Credits (SRECs) and other available incentives based on location

### User Management
- **Authentication**: Secure user registration and login system
- **Profile Management**: Users can manage their location and other profile details

### Results and Reporting
- **Comprehensive Analysis**: Combines data from proposals, utility bills, and external APIs to generate detailed reports
- **Savings Visualization**: Monthly breakdown of projected energy production, consumption, and savings
- **Financial Metrics**: Calculates payback period, ROI, and long-term savings

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** for database storage
- **JWT** for authentication
- **Multer** for file uploads
- **PDF-Parse** for extracting text from PDFs
- **Tesseract.js** for OCR processing of utility bills
- **Winston** for logging

### APIs
- **PVWatts API**: For solar production estimates
- **Google Sunroof API**: For roof solar potential assessment
- **SREC Trade API**: For SREC pricing and incentive information

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- API keys for external services (PVWatts, Google Sunroof, SREC Trade)

### Installation

1. Clone the repository:
```
git clone https://github.com/sachdevcode/solar-insight-explorer.git
cd solar-insight-explorer
```

2. Install dependencies:
```
cd backend
npm install
cd ../frontend
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in the backend directory
- Fill in your database connection and API keys

4. Start the development servers:
```
# Start backend server
cd backend
npm run dev

# Start frontend server in another terminal
cd frontend
npm start
```

5. The application should now be running at:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Upload
- `POST /api/upload` - Upload both proposal and utility bill
- `POST /api/upload/proposal` - Upload only proposal
- `POST /api/upload/utility-bill` - Upload only utility bill

### Results
- `GET /api/results` - Get all results for the authenticated user
- `GET /api/results/detail/:resultId` - Get specific result by ID
- `POST /api/results/generate` - Generate new results from existing proposal and utility bill
- `DELETE /api/results/:resultId` - Delete a result

### Solar Data
- `GET /api/solar-potential` - Get solar potential for a location
- `GET /api/solar-production` - Get solar production estimates
- `GET /api/srec-incentives` - Get SREC incentives for a location

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [National Renewable Energy Laboratory (NREL)](https://www.nrel.gov/) for the PVWatts API
- [Google Sunroof](https://sunroof.withgoogle.com/) for the solar potential API
