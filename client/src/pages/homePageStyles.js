export const homePageStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: #ffffff;
    padding: 0;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .dashboard-container {
    width: 100%;
    margin: 0;
    background: #ffffff;
    border-radius: 0;
    display: grid;
    grid-template-columns: 250px 1fr 300px;
    min-height: 100vh;
  }

  .sidebar-left {
    background: #ffffff;
    color: #111827;
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100vh;
    position: sticky;
    top: 0;
    border-right: 1px solid #e5e7eb;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding: 15px;
    background: transparent;
    border-radius: 10px;
  }

  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #111827;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
  }

  .profile-info h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .profile-info p {
    font-size: 11px;
    opacity: 0.7;
  }

  .nav-links {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #6b7280;
    text-decoration: none;
  }

  .nav-link:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .nav-link.active {
    background: #111827;
    color: white;
    font-weight: 600;
  }

  .nav-link i {
    width: 20px;
    text-align: center;
  }

  .nav-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .main-content {
    padding: 30px;
    height: 100vh;
    overflow-y: auto;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .top-bar h1 {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
  }

  .search-bar {
    flex: 1;
    max-width: 400px;
    margin: 0 30px;
    position: relative;
  }

  .search-bar input {
    width: 100%;
    padding: 12px 20px 12px 45px;
    border: 1px solid #e0e0e0;
    border-radius: 25px;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
  }

  .search-bar input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .search-bar i {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  .action-icons {
    display: flex;
    gap: 15px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-icon:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  .widget-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin-bottom: 45px;
  }

  .widget-card {
    background: white;
    border-radius: 22px;
    padding: 37px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .widget-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .widget-header {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
  }

  .widget-icon {
    width: 108px;
    height: 108px;
    border-radius: 27px;
    background: #111827;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: white;
  }

  .widget-info h3 {
    font-size: 22px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 6px;
  }

  .widget-info p {
    font-size: 16px;
    color: #6b7280;
  }

  .widget-badge {
    position: absolute;
    top: 30px;
    right: 30px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    background: #111827;
    color: white;
  }

  .widget-details {
    margin: 18px 0;
    color: #555;
    font-size: 17px;
    line-height: 1.6;
  }

  .widget-stats {
    display: flex;
    gap: 18px;
    font-size: 16px;
    color: #7f8c8d;
    margin-top: 12px;
  }

  .progress-bar {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid #f0f0f0;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #7f8c8d;
    margin-bottom: 10px;
  }

  .progress-track {
    height: 10px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #111827;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .locked-card {
    filter: blur(2px);
    opacity: 0.6;
  }

  .upgrade-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(5px);
  }

  .upgrade-btn {
    padding: 15px 40px;
    background: #111827;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upgrade-btn:hover {
    background: #000000;
    transform: scale(1.05);
  }

  .calendar-section {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .calendar-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }

  .calendar-toggle {
    padding: 8px 15px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    max-width: 50%;
  }

  .calendar-day-header {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #7f8c8d;
    padding: 10px 5px;
  }

  .calendar-day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .calendar-day:hover {
    background: #f3f4f6;
    border-color: #111827;
  }

  .calendar-day.has-event {
    background: #111827;
    color: white;
    border-color: #111827;
  }

  .calendar-event {
    position: absolute;
    bottom: 5px;
    font-size: 9px;
    text-align: center;
    width: 90%;
  }

  .sidebar-right {
    background: #ffffff;
    padding: 30px 20px;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-section {
    background: white;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .sidebar-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 15px;
  }

  .video-preview {
    position: relative;
    width: 100%;
    height: 150px;
    background: #f3f4f6;
    border-radius: 10px;
    margin-bottom: 15px;
    overflow: hidden;
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .play-button:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }

  .interview-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 10px;
  }

  .interview-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
  }

  .status-active {
    color: #27ae60;
    font-weight: 600;
  }

  .performance-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .performance-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .performance-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111827;
  }

  .performance-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .performance-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 3px;
  }

  .performance-info p {
    font-size: 12px;
    color: #6b7280;
  }

  .performance-badge {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: #111827;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }

  .notification-card {
    background: #f9fafb;
    border-radius: 10px;
    padding: 15px;
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .notification-content {
    flex: 1;
  }

  .notification-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 5px;
  }

  .notification-content p {
    font-size: 12px;
    color: #7f8c8d;
  }

  .notification-action {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .notification-action:hover {
    transform: rotate(90deg);
  }

  @media (max-width: 1200px) {
    .dashboard-container {
      grid-template-columns: 250px 1fr;
    }

    .sidebar-right {
      grid-column: 1 / -1;
      height: auto;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      grid-template-columns: 1fr;
    }

    .sidebar-left {
      display: none;
    }

    .widget-grid {
      grid-template-columns: 1fr;
    }

    .top-bar {
      flex-direction: column;
      gap: 15px;
    }

    .search-bar {
      margin: 0;
      max-width: 100%;
    }
  }
`;
