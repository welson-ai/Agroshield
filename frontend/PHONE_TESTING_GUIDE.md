# Phone Testing Guide for MiniPay

## Step 1: Access AgroShield on Your Phone

**URL to visit in MiniPay:**
```
http://192.168.1.44:3000
```

## Step 2: Testing Checklist

### Before You Start
- [ ] Make sure your phone and computer are on the same WiFi
- [ ] Open MiniPay app on your phone
- [ ] Enter the URL above in MiniPay browser

### What to Look For

#### MiniPay Detection (Should happen automatically)
- [ ] Page loads without wallet selection modal
- [ ] MiniPay wallet auto-connects
- [ ] See green "MP" badge in navbar
- [ ] cUSD balance appears (might show 0.0000)
- [ ] "Celo Mainnet" status shows

#### UI Differences
- [ ] NO RainbowKit wallet button
- [ ] MiniPay branded wallet component
- [ ] Green color scheme for MiniPay section
- [ ] "Disconnect" button available

#### Functionality Tests
- [ ] Try creating a policy (should work with MiniPay)
- [ ] Check pool page (should show MiniPay wallet)
- [ ] Test dashboard (should work with MiniPay connection)
- [ ] Try disconnect/reconnect

## Step 3: Expected Behavior

### MiniPay Users See:
```
[AgroShield Logo] [Navigation Links] [MP Wallet Badge]
                                         |
                                         v
                                  [Green MiniPay Wallet]
                                  - MP Badge
                                  - Address: 0x1234...5678
                                  - cUSD Balance: 0.0000 cUSD
                                  - Celo Mainnet
                                  [Disconnect]
```

### Regular Users See:
```
[AgroShield Logo] [Navigation Links] [Connect Wallet Button]
```

## Step 4: Troubleshooting

### If Auto-Connection Fails:
1. Refresh the page in MiniPay
2. Check if MiniPay has wallet permissions enabled
3. Try manually connecting if prompted

### If Wrong Network:
1. MiniPay should auto-detect Celo mainnet (chainId 42220)
2. If not, switch to Celo mainnet in MiniPay settings

### If Balance Shows 0:
1. This is normal for test addresses
2. The feature is working if the balance section appears

### If Page Doesn't Load:
1. Check both devices are on same WiFi
2. Verify the IP address: `192.168.1.44`
3. Make sure dev server is running on computer

## Step 5: Success Confirmation

The MiniPay feature is working if you see:
- [x] Auto-connection without modal
- [x] Green "MP" badge
- [x] cUSD balance section
- [x] No RainbowKit button
- [x] All pages work with MiniPay

## Step 6: Report Results

Please share:
1. Did auto-connection work? (Yes/No)
2. Did you see the MiniPay wallet UI? (Yes/No)
3. Were there any error messages?
4. Did policy creation work?
5. Any other observations?

---

**Quick Test URL:** `http://192.168.1.44:3000`  
**Device:** MiniPay app on your phone  
**Network:** Same WiFi as computer
