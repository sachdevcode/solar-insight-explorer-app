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
- **Mock Data Fallback**: All external API integrations gracefully fall back to realistic mock data when API keys aren't configured

### User Management
- **Authentication**: Secure user registration and login system
- **Profile Management**: Users can manage their location and other profile details
- **Public API Access**: External tools (PVWatts, Google Sunroof, SREC) are accessible without authentication

### Results and Reporting
- **Comprehensive Analysis**: Combines data from proposals, utility bills, and external APIs to generate detailed reports
- **Savings Visualization**: Monthly breakdown of projected energy production, consumption, and savings
- **Financial Metrics**: Calculates payback period, ROI, and long-term savings

## Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **React Router** for navigation
- **Axios** for API requests
- **Recharts** for data visualization

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
- API keys for external services (optional - the app will use mock data if not provided)

### Installation

1. Clone the repository:
```
git clone https://github.com/sachdevcode/solar-insight-explorer.git
cd solar-insight-explorer
```

2. Install dependencies for both frontend and backend:
```
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Set up environment variables:
```
# In the backend directory
cp .env.example .env
```
Edit the `.env` file to configure your MongoDB connection and optionally add API keys for external services.

4. Start the development servers:
```
# In the root directory, start the frontend
npm run dev

# In a separate terminal, start the backend
cd backend
npm run dev
```

5. The application should now be running at:
- Frontend: http://localhost:5173 (default Vite port)
- Backend: http://localhost:5000

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

### Solar Data (Public Endpoints)
- `GET /api/solar-potential` - Get solar potential for a location
- `GET /api/solar-production` - Get solar production estimates
- `GET /api/srec-incentives` - Get SREC incentives for a location

## External Tools Integration

The application provides integration with three external tools, all accessible through the ExternalTools component:

1. **Google Sunroof**: Allows users to check the solar potential of their property by entering an address
   - The API will return details about roof segments, potential system size, and production estimates
   - If no API key is configured, realistic mock data will be returned

2. **PVWatts Calculator**: Enables users to estimate solar production based on system size and location
   - Users can adjust system size, array type, and tilt for customized estimates
   - Returns monthly and annual production estimates along with potential savings

3. **SREC Trade**: Checks for Solar Renewable Energy Credit availability and pricing in the user's state
   - Shows if SRECs are available, current rates, and estimated annual value
   - Also displays other applicable solar incentives in the state

All external tool integrations gracefully handle missing API keys by providing realistic mock data, ensuring the application remains fully functional even without external API access.

## Development Notes

- The application uses mock data when API keys aren't configured, making it easy to develop and test without external dependencies
- Public API endpoints don't require authentication, allowing for easier integration with frontend components
- Error handling is implemented throughout the application, with graceful fallbacks to mock data when external services fail

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [National Renewable Energy Laboratory (NREL)](https://www.nrel.gov/) for the PVWatts API
- [Google Sunroof](https://sunroof.withgoogle.com/) for the solar potential API
