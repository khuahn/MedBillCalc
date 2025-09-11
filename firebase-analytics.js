/*
 * firebase-analytics.js - Firebase Analytics for MedBillCalc
 */

(() => {
  "use strict";
  
  const USER_KEY = 'mbcUser';
  
  // Get user data
  function getUserData() {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  
  // Save user data
  function saveUserData(name) {
    const userData = {
      name: name,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      // Generate a unique ID for this user
      userId: Math.random().toString(36).substring(2) + Date.now().toString(36)
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return userData;
  }
  
  // Update last visit
  function updateLastVisit() {
    const userData = getUserData();
    if (userData) {
      userData.lastVisit = new Date().toISOString();
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }
  
  // Get user's IP and location
  async function getUserInfo() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        timezone: data.timezone
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return {
        ip: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        timezone: 'Unknown'
      };
    }
  }
  
  // Get device info
  function getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      deviceType: getDeviceType()
    };
  }
  
  // Determine device type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "Tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "Mobile";
    }
    return "Desktop";
  }
  
  // Record visit to Firebase
  async function recordVisitToFirebase(userName) {
    try {
      const userInfo = await getUserInfo();
      const deviceInfo = getDeviceInfo();
      const userData = getUserData() || saveUserData(userName);
      
      const visitData = {
        timestamp: new Date().toISOString(),
        userName: userName,
        userId: userData.userId,
        ip: userInfo.ip,
        city: userInfo.city,
        region: userInfo.region,
        country: userInfo.country,
        timezone: userInfo.timezone,
        deviceType: deviceInfo.deviceType,
        platform: deviceInfo.platform,
        screen: deviceInfo.screen,
        userAgent: deviceInfo.userAgent,
        page: window.location.href
      };
      
      // Add a new document with a generated ID
      await db.collection("visits").add(visitData);
      
      return visitData;
    } catch (error) {
      console.error("Error saving visit to Firebase:", error);
    }
  }
  
  // Get analytics from Firebase
  async function getAnalyticsFromFirebase() {
    try {
      const snapshot = await db.collection("visits")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting analytics from Firebase:", error);
      return [];
    }
  }
  
  // Display analytics
  async function displayAnalytics() {
    const analyticsData = document.getElementById('analyticsData');
    analyticsData.innerHTML = '<p>Loading analytics data...</p>';
    
    try {
      const visits = await getAnalyticsFromFirebase();
      
      if (visits.length === 0) {
        analyticsData.innerHTML = '<p>No data available yet.</p>';
        return;
      }
      
      let html = `
        <div style="overflow-x: auto;">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Location</th>
                <th>Device</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      visits.forEach(visit => {
        const date = new Date(visit.timestamp);
        html += `
          <tr>
            <td>${date.toLocaleString()}</td>
            <td>${visit.userName || 'Anonymous'}</td>
            <td>${visit.city}, ${visit.country}</td>
            <td>${visit.deviceType} (${visit.platform})</td>
            <td>${visit.ip}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
        <p>Total visits: ${visits.length}</p>
        <p><small>Showing last 50 visits</small></p>
      `;
      
      analyticsData.innerHTML = html;
    } catch (error) {
      analyticsData.innerHTML = '<p>Error loading analytics data.</p>';
    }
  }
  
  // Initialize analytics
  function initAnalytics() {
    const userData = getUserData();
    
    // Show welcome modal if no user data
    if (!userData) {
      const modal = document.getElementById('welcomeModal');
      if (modal) {
        modal.style.display = 'block';
        
        document.getElementById('submitName').addEventListener('click', async () => {
          const userName = document.getElementById('userName').value.trim();
          if (userName) {
            saveUserData(userName);
            await recordVisitToFirebase(userName);
            modal.style.display = 'none';
          }
        });
      }
    } else {
      // Update last visit and record current visit
      updateLastVisit();
      recordVisitToFirebase(userData.name);
    }
    
    // Setup analytics button
    const analyticsBtn = document.getElementById('analyticsBtn');
    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', () => {
        const modal = document.getElementById('analyticsModal');
        if (modal) {
          displayAnalytics();
          modal.style.display = 'block';
        }
      });
    }
    
    // Close analytics modal
    const closeAnalytics = document.getElementById('closeAnalytics');
    if (closeAnalytics) {
      closeAnalytics.addEventListener('click', () => {
        const modal = document.getElementById('analyticsModal');
        if (modal) {
          modal.style.display = 'none';
        }
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('analyticsModal');
      if (event.target === modal) {
        modal.style.display = 'none';
      }
      
      const welcomeModal = document.getElementById('welcomeModal');
      if (event.target === welcomeModal) {
        welcomeModal.style.display = 'none';
      }
    });
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initAnalytics);
  
})();

// Add this to your firebase-analytics.js file:

// Secret keyword to access analytics (change this to your own secret word)
const ADMIN_KEYWORD = 'medbilladmin';

// Check if admin access is requested
function checkAdminAccess() {
  if (window.location.hash === `#${ADMIN_KEYWORD}`) {
    // Show analytics button for admin
    const analyticsBtn = document.createElement('button');
    analyticsBtn.id = 'analyticsBtn';
    analyticsBtn.className = 'analytics-btn';
    analyticsBtn.title = 'View Analytics';
    analyticsBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
    document.body.appendChild(analyticsBtn);
    
    // Set up analytics button functionality
    analyticsBtn.addEventListener('click', () => {
      const modal = document.getElementById('analyticsModal');
      if (modal) {
        displayAnalytics();
        modal.style.display = 'block';
      }
    });
    
    // Remove the hash from URL to keep it secret
    window.history.replaceState(null, null, ' ');
  }
}

// Call this function in your initAnalytics function
function initAnalytics() {
  checkAdminAccess(); // Add this line first
  
  // ... rest of your existing initAnalytics code
}
