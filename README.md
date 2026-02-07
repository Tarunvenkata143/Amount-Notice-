# 💰 Daily Expense & Savings Tracker

A frontend-only expense and savings tracker built with vanilla HTML, CSS, and JavaScript. Perfect for tracking daily expenses, managing multiple bank accounts, and monitoring savings goals.

## ✨ Features

### 🔐 Authentication
- Single passcode authentication (frontend-only)
- Default passcode: `1234`
- Secure logout functionality

### 👥 Dual User Support
- **Person A** - Independent expense tracking
- **Person B** - Independent expense tracking
- Completely separate data for each person
- No data mixing between users

### 🏦 Bank Management
Each person can manage:
- **Bank 1** - Track first bank balance
- **Bank 2** - Track second bank balance
- Automatic total calculation when both banks are entered

### 📊 Daily Expense Tracking
Excel-like table interface with:
- **Date** - Entry date
- **Added (₹)** - Income/Money added
- **Used (₹)** - Money spent
- **Savings (₹)** - Daily savings (auto-calculated)
- **Balance (₹)** - Current balance (auto-calculated)

**Balance Formula:** Added - Used

### 💚 Daily Savings
Three flexible savings options:
- **₹20** - Standard daily saving
- **₹30** - Higher daily saving
- **Holiday (₹0)** - No saving on holidays

Features:
- Apply same savings rule to both persons automatically
- Date-wise savings tracking
- Monthly savings totals

### 📈 Monthly Summary
Comprehensive monthly reports for:
- **Person A** - Monthly added, used, savings, and balance
- **Person B** - Monthly added, used, savings, and balance
- **Combined Total** - Both persons combined statistics

### 💾 Data Persistence
- All data stored in browser LocalStorage
- Works offline
- Persists across browser sessions
- Data survives page refresh

## 📁 Project Structure

```
expense-excel-tracker/
├── index.html              # Login page
├── dashboard.html          # Main application page
├── css/
│   └── styles.css         # All styling (responsive design)
├── js/
│   ├── storage.js         # LocalStorage management
│   ├── auth.js            # Authentication logic
│   ├── personA.js         # Person A expense management
│   ├── personB.js         # Person B expense management
│   ├── savings.js         # Savings management
│   └── summary.js         # Monthly summary calculations
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## 🚀 How to Use

### 1. **Open the App**
- Open `index.html` in your web browser
- Enter the passcode (default: `1234`)
- Click **Login**

### 2. **Set Bank Amounts**
For each person:
- Enter Bank 1 amount
- Enter Bank 2 amount (optional)
- Click **Save Banks**

### 3. **Add Daily Entries**
- Click **➕ Add Daily Entry** under each person
- Fill in the date
- Enter **Added** amount (money received)
- Enter **Used** amount (money spent)
- Balance and savings auto-calculate

### 4. **Manage Savings**
- Click **➕ Add Savings** under Daily Savings section
- Select date
- Choose savings option (₹20, ₹30, or Holiday)
- Amount auto-fills based on selection
- Savings automatically update in both person tables

### 5. **View Monthly Summary**
- Select month from the **Month selector**
- Click **View Summary**
- See detailed breakdown for both persons and combined totals

### 6. **Delete Entries**
- Click **❌** button next to any entry to delete
- Confirm deletion when prompted

## 🔐 Changing the Passcode

Edit `js/auth.js` and change this line:
```javascript
const COMMON_PASSCODE = "1234";
```

## 💻 Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🌐 GitHub Pages Deployment

This app is ready for GitHub Pages deployment:

1. Create a GitHub repository
2. Push all files to the repository
3. Enable GitHub Pages in Settings
4. Deploy from main branch
5. Access via `https://yourusername.github.io/expense-excel-tracker`

**Note:** The app works completely offline and requires NO backend server.

## 📱 Responsive Design

- Works on desktop browsers
- Mobile-friendly interface
- Responsive table design
- Touch-friendly buttons and inputs

## 🔒 Data Privacy

- **All data stored locally** in your browser using LocalStorage
- No data sent to any server
- No cloud storage required
- Complete privacy - only you can access your data
- Data cleared only when you clear browser cache/storage

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and flexbox
- **JavaScript (ES6+)** - Pure vanilla JavaScript, no frameworks

### Key Features
- Event-driven architecture
- Modular code organization
- Automatic calculations
- Real-time data persistence
- Authentication check on each page

### Storage Keys (LocalStorage)
- `personA_bank` - Person A bank data
- `personA_entries` - Person A daily entries
- `personB_bank` - Person B bank data
- `personB_entries` - Person B daily entries
- `savings_entries` - Common savings entries
- `isLoggedIn` - Authentication status

## 📝 Example Use Cases

### Personal Finance Tracking
Track your daily expenses and savings goals independently.

### Family Budget Management
Each family member can track their own finances separately.

### Business Expense Tracking
Manage two different business accounts and track daily operations.

### Savings Goals
Monitor daily savings with flexible options and track progress monthly.

## ⚡ Performance

- **Instant loading** - No server requests
- **Fast calculations** - Real-time updates
- **Lightweight** - Small file sizes
- **Minimal dependencies** - Pure HTML, CSS, JavaScript

## 🐛 Troubleshooting

### Data Not Saving
- Check if browser allows LocalStorage
- Ensure you're not in private/incognito mode
- Clear cache and try again

### Can't Login
- Default passcode is `1234`
- Check if you changed the passcode in `auth.js`

### Entries Not Showing
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors (F12)

### Missing CSS Styling
- Verify `styles.css` is in the `css` folder
- Check file path is correct in HTML files

## 📄 License

Free to use and modify. No attribution required.

## 🤝 Contributing

Feel free to fork and customize for your needs. Some ideas:
- Add currency selection
- Add category tags
- Export to CSV
- Add more savings options
- Multi-language support

## 📞 Support

If you encounter any issues:
1. Check the browser console (F12 → Console)
2. Verify all files are in correct folders
3. Ensure JavaScript is enabled
4. Try clearing cache and refreshing

---

**Happy Tracking! 💰**

Built with ❤️ using vanilla HTML, CSS, and JavaScript.
