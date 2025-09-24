/**
 * Vercel Serverless Function for Bug Reports
 * Handles bug reports from the WebRPG game
 */

export default async function handler(req, res) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Method not allowed. Use POST.' 
        });
    }

    try {
        const { logEntry, timestamp, gameVersion } = req.body;
        
        // Validate required fields
        if (!logEntry) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: logEntry'
            });
        }

        // Log to Vercel's function logs (visible in Vercel dashboard)
        console.log('=== WEBRPG BUG REPORT ===');
        console.log(`Timestamp: ${timestamp || new Date().toISOString()}`);
        console.log(`Game Version: ${gameVersion || 'unknown'}`);
        console.log(`User Agent: ${req.headers['user-agent'] || 'unknown'}`);
        console.log(`IP Address: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'}`);
        console.log('--- Bug Report Details ---');
        console.log(logEntry);
        console.log('==========================');
        
        // In production, you might want to:
        // 1. Save to a database (MongoDB, PostgreSQL, etc.)
        // 2. Send to a logging service (LogRocket, Sentry, etc.)
        // 3. Send email notifications for critical bugs
        // 4. Store in a file storage service (AWS S3, etc.)
        
        // For now, we'll just log it to Vercel's function logs
        // You can view these in your Vercel dashboard under Functions > Logs
        
        res.status(200).json({ 
            success: true, 
            message: 'Bug report received successfully',
            timestamp: new Date().toISOString(),
            reportId: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        
    } catch (error) {
        console.error('Error processing bug report:', error);
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while processing bug report',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}
