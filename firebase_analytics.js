/*
 * firebase-analytics.js - Firebase Analytics for MedBillCalc
 */

// Import Firebase functions at the top
import { collection, addDoc, orderBy, limit, getDocs, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

(() => {
  "use strict";
  
  const USER_KEY = 'mbcUser';
  
  // ... rest of your code remains the same until the Firebase functions
  
  // Record visit to Firebase (updated for modular Firebase)
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
      
      // Add a new document with a generated ID (modular syntax)
      await addDoc(collection(db, "visits"), visitData);
      
      return visitData;
    } catch (error) {
      console.error("Error saving visit to Firebase:", error);
    }
  }
  
  // Get analytics from Firebase (updated for modular Firebase)
  async function getAnalyticsFromFirebase() {
    try {
      const q = query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(50));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting analytics from Firebase:", error);
      return [];
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
    checkAdminAccess(); // Check for admin access first
    
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
        // If user closes without entering name, record as anonymous
        if (!getUserData()) {
          saveUserData('Anonymous');
          recordVisitToFirebase('Anonymous');
        }
      }
    });
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initAnalytics);
  
})();

// Add this function to debug data recording
async function debugDataRecording(userName) {
  try {
    console.log("Attempting to record visit for:", userName);
    
    const userInfo = await getUserInfo();
    console.log("User info:", userInfo);
    
    const deviceInfo = getDeviceInfo();
    console.log("Device info:", deviceInfo);
    
    const visitData = {
      timestamp: new Date().toISOString(),
      userName: userName,
      userId: Math.random().toString(36).substring(2) + Date.now().toString(36),
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
    
    console.log("Visit data to be saved:", visitData);
    
    // Add a new document with a generated ID
    const docRef = await db.collection("visits").add(visitData);
    console.log("Document written with ID: ", docRef.id);
    
    return visitData;
  } catch (error) {
    console.error("Error saving visit to Firebase:", error);
  }
}

// Add this function to test Firebase connection
async function testFirebaseConnection() {
  try {
    console.log("Testing Firebase connection...");
    
    // Try to add a test document
    const testRef = await db.collection("test").add({
      test: "connection_test",
      timestamp: new Date().toISOString()
    });
    
    console.log("Test document created with ID:", testRef.id);
    
    // Try to read it back
    const testDoc = await db.collection("test").doc(testRef.id).get();
    
    if (testDoc.exists) {
      console.log("Firebase connection successful! Data:", testDoc.data());
      return true;
    } else {
      console.log("Firebase test failed - document not found");
      return false;
    }
  } catch (error) {
    console.error("Firebase connection error:", error);
    return false;
  }
}

// Call this function when your app loads
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for Firebase to initialize
  setTimeout(() => {
    testFirebaseConnection();
  }, 1000);
});
