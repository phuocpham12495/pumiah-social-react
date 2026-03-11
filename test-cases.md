## [TC001_001] Successful User Sign-up and Confirmation Email
**Preconditions:** User is on the sign-up page. A unique email address is available.

**Steps:**
1. Navigate to the sign-up page.
2. Enter a unique email address.
3. Enter a valid password (e.g., 'Password123!').
4. Confirm the password.
5. Click the 'Sign Up' button.

**Expected Result:** User is redirected to an email verification message/page. A confirmation email is sent to the provided email address.

---

## [TC001_002] Email Confirmation and Redirection to Profile Creation
**Preconditions:** A new user has signed up (TC001_001 passed) and received a confirmation email.

**Steps:**
1. Open the confirmation email.
2. Click on the verification link in the email.
3. Upon successful email confirmation, navigate to the login page.
4. Enter the confirmed email and password.
5. Click 'Login'.

**Expected Result:** User is successfully logged in and redirected to the profile creation page.

---

## [TC001_003] Prevent Duplicate Email Sign-ups
**Preconditions:** An account with 'existing@example.com' already exists and is confirmed.

**Steps:**
1. Navigate to the sign-up page.
2. Enter 'existing@example.com' as the email address.
3. Enter a valid password.
4. Confirm the password.
5. Click the 'Sign Up' button.

**Expected Result:** System displays an error message indicating that the email address is already registered.

---

## [TC002_001] Successful User Login with Correct Credentials
**Preconditions:** A registered and confirmed user ('test@example.com', 'Password123!') exists.

**Steps:**
1. Navigate to the login page.
2. Enter the registered email 'test@example.com'.
3. Enter the correct password 'Password123!'.
4. Click the 'Login' button.

**Expected Result:** User is successfully logged in and redirected to the main application feed or their profile creation page if first login.

---

## [TC002_002] Login with Incorrect Credentials
**Preconditions:** User is on the login page.

**Steps:**
1. Navigate to the login page.
2. Enter a registered email 'test@example.com'.
3. Enter an incorrect password (e.g., 'WrongPass123').
4. Click the 'Login' button.

**Expected Result:** An error message (e.g., 'Invalid email or password') is displayed on the login page. User remains on the login page.

---

## [TC002_003] Session Persistence After Login
**Preconditions:** User 'test@example.com' is successfully logged in.

**Steps:**
1. Successfully log in as 'test@example.com'.
2. Close the browser/application tab without explicitly logging out.
3. Re-open the browser/application and navigate to the application URL.

**Expected Result:** User is automatically logged in or their session is restored, redirecting them to the main application feed without requiring re-entry of credentials.

---

## [TC003_001] View Current Profile Settings
**Preconditions:** User 'test@example.com' is logged in and has a profile.

**Steps:**
1. Log in as 'test@example.com'.
2. Navigate to 'Profile Settings'.

**Expected Result:** The profile settings page displays current avatar, email address, date of birth, and other editable app settings fields.

---

## [TC003_002] Update Profile Avatar
**Preconditions:** User 'test@example.com' is logged in and on the Profile Settings page.

**Steps:**
1. Click on the option to change the avatar.
2. Upload a new image file (e.g., 'new_avatar.png').
3. Confirm the change/save settings.

**Expected Result:** The new avatar is successfully uploaded and reflected on the profile settings page and the user's main profile.

---

## [TC003_003] Update Profile Email with Re-confirmation
**Preconditions:** User 'test@example.com' is logged in and on the Profile Settings page. A unique new email 'new@example.com' is available.

**Steps:**
1. Change the email address field to 'new@example.com'.
2. Save the settings.
3. Check the 'new@example.com' inbox for a confirmation email.
4. Click the verification link in the new email.

**Expected Result:** System sends a confirmation email to 'new@example.com'. After clicking the link, the email address associated with the user's account is successfully updated to 'new@example.com'.

---

## [TC003_004] Update Profile Date of Birth
**Preconditions:** User 'test@example.com' is logged in and on the Profile Settings page.

**Steps:**
1. Click on the date of birth field.
2. Select a new date (e.g., '01/01/1990').
3. Save the settings.

**Expected Result:** The date of birth is successfully updated and saved. The new date is reflected on the profile settings page.

---

## [TC004_001] First-time Login Prompts Profile Creation
**Preconditions:** A newly registered and email-confirmed user ('newuser@example.com') exists who has not yet created a profile.

**Steps:**
1. Log in as 'newuser@example.com' for the first time.

**Expected Result:** User is redirected to a profile creation page, prompting them to enter their name, bio, and upload a profile photo.

---

## [TC004_002] View Own Profile with Basic Information
**Preconditions:** User 'test@example.com' has a completed profile (name, bio, profile photo, join date set, has friends).

**Steps:**
1. Log in as 'test@example.com'.
2. Navigate to 'My Profile'.

**Expected Result:** The profile page displays the user's name, profile photo, bio, join date, and a list of their friends.

---

## [TC004_003] Upload and Display Optional Cover Photo
**Preconditions:** User 'test@example.com' is logged in and on their profile editing page.

**Steps:**
1. Upload an image as a cover photo.
2. Save profile changes.
3. Navigate to 'My Profile'.

**Expected Result:** The uploaded cover photo is displayed prominently on the user's profile page.

---

## [TC004_004] Add and Display Optional Location
**Preconditions:** User 'test@example.com' is logged in and on their profile editing page.

**Steps:**
1. Enter a location (e.g., 'New York, USA') into the designated field.
2. Save profile changes.
3. Navigate to 'My Profile'.

**Expected Result:** The entered location 'New York, USA' is displayed on the user's profile page.

---

## [TC005_001] Navigate to Another User's Profile
**Preconditions:** User 'test@example.com' is logged in. Another user 'friend@example.com' exists and is visible on the feed or friend list.

**Steps:**
1. Log in as 'test@example.com'.
2. On the main feed or friend list, locate 'friend@example.com'.
3. Click on 'friend@example.com''s name or avatar.

**Expected Result:** User is taken to the profile page of 'friend@example.com'.

---

## [TC005_002] View Another User's Public Profile Information
**Preconditions:** User 'test@example.com' is viewing 'friend@example.com''s profile (TC005_001 passed). 'friend@example.com' has a public profile.

**Steps:**
1. Observe the profile page content for 'friend@example.com'.

**Expected Result:** The profile page displays 'friend@example.com''s name, profile photo, bio, join date, and their public friends list.

---

## [TC005_003] View Another User's Optional Profile Information
**Preconditions:** User 'test@example.com' is viewing 'friend@example.com''s profile. 'friend@example.com' has set a cover photo and location.

**Steps:**
1. Observe the profile page content for 'friend@example.com'.

**Expected Result:** The profile page displays 'friend@example.com''s cover photo and location.

---

## [TC006_001] Send a Friend Request and Button State Change
**Preconditions:** User 'A' is logged in. User 'B' exists and is not a friend of User 'A' and no pending request exists.

**Steps:**
1. Log in as User 'A'.
2. Navigate to User 'B''s profile page.
3. Click the 'Add Friend' button.

**Expected Result:** A friend request is sent to User 'B'. The 'Add Friend' button changes its text to 'Request Sent' or similar, and is disabled.

---

## [TC006_002] Cannot Send Friend Request to an Existing Friend
**Preconditions:** User 'A' is logged in. User 'B' is already a friend of User 'A'.

**Steps:**
1. Log in as User 'A'.
2. Navigate to User 'B''s profile page.

**Expected Result:** The 'Add Friend' button is not visible, or it displays 'Friends'/'Already Friends' and is disabled.

---

## [TC006_003] Cannot Send Friend Request to Self
**Preconditions:** User 'A' is logged in.

**Steps:**
1. Log in as User 'A'.
2. Navigate to User 'A''s own profile page.

**Expected Result:** There is no 'Add Friend' button displayed on the user's own profile page.

---

## [TC007_001] View Pending Friend Request in Notifications
**Preconditions:** User 'B' has a pending friend request from User 'A'. User 'B' is logged in.

**Steps:**
1. Log in as User 'B'.
2. Navigate to the 'Notifications' or 'Friend Requests' section.

**Expected Result:** User 'B' sees the pending friend request from User 'A' with options to 'Accept' or 'Decline'.

---

## [TC007_002] Accept a Pending Friend Request
**Preconditions:** User 'B' is viewing a pending friend request from User 'A' (TC007_001 passed).

**Steps:**
1. Log in as User 'B'.
2. Navigate to the 'Friend Requests' section.
3. Click the 'Accept' button for the request from User 'A'.

**Expected Result:** User 'A' is added to User 'B''s friend list. The request is removed from pending. User 'A' receives a notification that User 'B' accepted their request.

---

## [TC007_003] Decline a Pending Friend Request
**Preconditions:** User 'B' is viewing a pending friend request from User 'A' (TC007_001 passed).

**Steps:**
1. Log in as User 'B'.
2. Navigate to the 'Friend Requests' section.
3. Click the 'Decline' button for the request from User 'A'.

**Expected Result:** The friend request from User 'A' is dismissed and removed from User 'B''s pending requests. User 'A' does NOT receive a notification.

---

## [TC008_001] View Own List of Friends
**Preconditions:** User 'test@example.com' is logged in and has at least one accepted friend.

**Steps:**
1. Log in as 'test@example.com'.
2. Navigate to the 'Friends List' section.

**Expected Result:** A list of all accepted friends is displayed. Each friend's name and/or avatar is visible.

---

## [TC008_002] Navigate to Friend's Profile from Friend List
**Preconditions:** User 'test@example.com' is logged in and viewing their friend list (TC008_001 passed). User 'friend@example.com' is in the list.

**Steps:**
1. On the friend list, click on 'friend@example.com''s name.

**Expected Result:** User is redirected to 'friend@example.com''s profile page.

---

## [TC009_001] Remove a Friend from Profile Page
**Preconditions:** User 'A' and User 'B' are friends. User 'A' is logged in.

**Steps:**
1. Log in as User 'A'.
2. Navigate to User 'B''s profile page.
3. Click the 'Remove Friend' button.

**Expected Result:** User 'B' is removed from User 'A''s friend list. The button changes to 'Add Friend'. User 'B' no longer sees User 'A' in their friend list.

---

## [TC009_002] Remove a Friend from Friends List Page
**Preconditions:** User 'A' and User 'B' are friends. User 'A' is logged in.

**Steps:**
1. Log in as User 'A'.
2. Navigate to 'My Friend List'.
3. Locate User 'B' and click the 'Remove Friend' option next to their name.

**Expected Result:** User 'B' is removed from User 'A''s friend list. User 'B' no longer sees User 'A' in their friend list.

---

## [TC010_001] Create and Display a New Text Post
**Preconditions:** User 'A' is logged in and has at least one friend (User 'B').

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post creation interface.
3. Enter text content (e.g., 'Hello friends, enjoying the app!').
4. Click the 'Post' button.

**Expected Result:** The text post 'Hello friends, enjoying the app!' appears on User 'A''s feed and User 'B''s feed. The post displays User 'A''s name and profile picture.

---

## [TC011_001] Create and Display a New Image Post with Optional Text
**Preconditions:** User 'A' is logged in and has at least one friend (User 'B'). An image file ('sunset.jpg') is available.

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post creation interface.
3. Select the option to upload an image.
4. Upload 'sunset.jpg'.
5. Optionally, add text (e.g., 'Beautiful sunset today!').
6. Click the 'Post' button.

**Expected Result:** The image post (with 'sunset.jpg' and optional text) appears on User 'A''s feed and User 'B''s feed. The image is displayed correctly, and User 'A''s name and profile picture are shown.

---

## [TC012_001] Create and Display a New Link Post with Optional Text
**Preconditions:** User 'A' is logged in and has at least one friend (User 'B').

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post creation interface.
3. Select the option to post a link.
4. Enter a valid URL (e.g., 'https://www.example.com').
5. Optionally, add text (e.g., 'Check out this interesting article!').
6. Click the 'Post' button.

**Expected Result:** The link post (with 'https://www.example.com' and optional text) appears on User 'A''s feed and User 'B''s feed. The link is clickable and, when clicked, directs to 'https://www.example.com'. User 'A''s name and profile picture are shown.

---

## [TC013_001] View Feed with Only Friends' Posts
**Preconditions:** User 'A' is logged in. User 'B' is a friend of User 'A'. User 'C' is NOT a friend of User 'A'. Both User 'B' and User 'C' have created recent posts.

**Steps:**
1. Log in as User 'A'.
2. Navigate to the main feed.

**Expected Result:** The main feed displays posts created by User 'B'. No posts from User 'C' are visible on the feed.

---

## [TC013_002] Feed Posts Ordered Chronologically
**Preconditions:** User 'A' is logged in. User 'B' is a friend of User 'A' and has created multiple posts at different times.

**Steps:**
1. Log in as User 'A'.
2. Navigate to the main feed.
3. Observe the order of posts from User 'B'.

**Expected Result:** Posts on the feed are ordered chronologically, with the newest posts appearing at the top.

---

## [TC014_001] Like a Post and Increment Like Count
**Preconditions:** User 'A' is logged in. User 'B' has created a post. User 'A' is viewing User 'B''s post.

**Steps:**
1. Log in as User 'A'.
2. Navigate to a post created by User 'B'.
3. Observe the initial like count (e.g., 0).
4. Click the 'Like' button on the post.

**Expected Result:** The like count on the post increases by one (e.g., to 1). The 'Like' button changes state (e.g., color change) to indicate it has been liked by User 'A'.

---

## [TC014_002] Unlike a Post
**Preconditions:** User 'A' has liked a post created by User 'B' (TC014_001 passed).

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post previously liked.
3. Observe the current like count (e.g., 1).
4. Click the 'Like' button (which should now indicate it's liked) again to unlike.

**Expected Result:** The like count on the post decreases by one (e.g., to 0). The 'Like' button reverts to its original state.

---

## [TC014_003] Post Creator Receives Like Notification
**Preconditions:** User 'A' is logged in. User 'B' has created a post. User 'A' likes User 'B''s post.

**Steps:**
1. Log in as User 'A'.
2. Like a post created by User 'B'.
3. Log out as User 'A'.
4. Log in as User 'B'.
5. Navigate to the notifications section.

**Expected Result:** User 'B' receives a notification stating 'User A liked your post'.

---

## [TC015_001] Add a Comment to a Post and Display
**Preconditions:** User 'A' is logged in. User 'B' has created a post.

**Steps:**
1. Log in as User 'A'.
2. Navigate to a post created by User 'B'.
3. Locate the comment field.
4. Enter text (e.g., 'Great post!').
5. Click the 'Submit' or 'Comment' button.

**Expected Result:** The comment 'Great post!' appears under User 'B''s post. The comment displays User 'A''s name, profile picture, and the comment content.

---

## [TC015_002] Post Creator Receives Comment Notification
**Preconditions:** User 'A' is logged in. User 'B' has created a post. User 'A' comments on User 'B''s post.

**Steps:**
1. Log in as User 'A'.
2. Add a comment to a post created by User 'B'.
3. Log out as User 'A'.
4. Log in as User 'B'.
5. Navigate to the notifications section.

**Expected Result:** User 'B' receives a notification stating 'User A commented on your post'.

---

## [TC016_001] Like a Comment and Increment Like Count
**Preconditions:** User 'A' is logged in. User 'B' has made a comment on a post. User 'A' is viewing User 'B''s comment.

**Steps:**
1. Log in as User 'A'.
2. Navigate to a post with a comment from User 'B'.
3. Observe the initial like count on User 'B''s comment (e.g., 0).
4. Click the 'Like' button on User 'B''s comment.

**Expected Result:** The like count on User 'B''s comment increases by one. The 'Like' button changes state to indicate it has been liked by User 'A'.

---

## [TC016_002] Comment Author Receives Like Notification
**Preconditions:** User 'A' is logged in. User 'B' has made a comment. User 'A' likes User 'B''s comment.

**Steps:**
1. Log in as User 'A'.
2. Like a comment made by User 'B'.
3. Log out as User 'A'.
4. Log in as User 'B'.
5. Navigate to the notifications section.

**Expected Result:** User 'B' receives a notification stating 'User A liked your comment'.

---

## [TC017_001] Delete Own Comment
**Preconditions:** User 'A' is logged in and has made a comment on a post.

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post containing User 'A''s comment.
3. Locate User 'A''s comment.
4. Click the 'Delete' option associated with the comment.

**Expected Result:** User 'A''s comment is successfully removed from the post.

---

## [TC017_002] Cannot Delete Other Users' Comments
**Preconditions:** User 'A' is logged in. User 'B' has made a comment on a post.

**Steps:**
1. Log in as User 'A'.
2. Navigate to the post containing User 'B''s comment.
3. Locate User 'B''s comment.

**Expected Result:** There is no 'Delete' option displayed for User 'B''s comment when viewed by User 'A'.

---

## [TC018_001] Receive 'Post Liked' Notification
**Preconditions:** User 'A' has a post. User 'B' is a friend of User 'A'. User 'B' likes User 'A''s post.

**Steps:**
1. Log in as User 'A'.
2. Have User 'B' like one of User 'A''s posts (e.g., from another browser/incognito session).
3. Navigate to User 'A''s notifications section.

**Expected Result:** User 'A' receives a notification: 'User B liked your post'.

---

## [TC018_002] Receive 'Post Commented' Notification
**Preconditions:** User 'A' has a post. User 'B' is a friend of User 'A'. User 'B' comments on User 'A''s post.

**Steps:**
1. Log in as User 'A'.
2. Have User 'B' comment on one of User 'A''s posts.
3. Navigate to User 'A''s notifications section.

**Expected Result:** User 'A' receives a notification: 'User B commented on your post'.

---

## [TC018_003] Receive 'Friend Request Received' Notification
**Preconditions:** User 'A' exists. User 'B' sends a friend request to User 'A'.

**Steps:**
1. Log in as User 'A'.
2. Have User 'B' send a friend request to User 'A'.
3. Navigate to User 'A''s notifications section.

**Expected Result:** User 'A' receives a notification: 'User B sent you a friend request'.

---

## [TC018_004] Notifications Viewable in Dedicated Section and via Badge
**Preconditions:** User 'A' has unread notifications (e.g., a new like, comment, or friend request).

**Steps:**
1. Log in as User 'A'.
2. Observe the navigation bar/header area.
3. Navigate to the 'Notifications' section.

**Expected Result:** A visual indicator (e.g., a badge with a number) is displayed on the notifications icon/menu item. All received notifications are listed and viewable within the dedicated notifications section.

---

## [TC019_001] UI Adaptability on Desktop
**Preconditions:** The application is running and accessible.

**Steps:**
1. Access the application using a desktop web browser (e.g., Chrome, Firefox).
2. Resize the browser window from maximum width to a narrower desktop resolution (e.g., 1024px width).
3. Interact with various features (login, profile, feed, post creation).

**Expected Result:** The UI layout and elements adapt gracefully to different desktop screen sizes. All features remain fully functional, and text/images are legible and properly scaled without horizontal scrolling.

---

## [TC019_002] UI Adaptability on Tablet
**Preconditions:** The application is running and accessible.

**Steps:**
1. Access the application using a tablet device or a browser's developer tools simulating a tablet (e.g., iPad Air 2).
2. Rotate the device/simulation between portrait and landscape orientations.
3. Interact with various features (login, profile, feed, post creation).

**Expected Result:** The UI layout and elements adapt appropriately for tablet screen sizes and orientations. All features remain fully functional, and text/images are legible and properly scaled.

---

## [TC019_003] UI Adaptability on Smartphone
**Preconditions:** The application is running and accessible.

**Steps:**
1. Access the application using a smartphone device or a browser's developer tools simulating a smartphone (e.g., iPhone 12).
2. Rotate the device/simulation between portrait and landscape orientations.
3. Interact with various features (login, profile, feed, post creation).

**Expected Result:** The UI layout and elements adapt appropriately for smartphone screen sizes and orientations. All features remain fully functional, and text/images are legible and properly scaled, utilizing mobile-first design principles where applicable.

---

## [TC020_001] View Previously Loaded Posts While Offline
**Preconditions:** User 'A' has previously accessed the app online and viewed their feed with posts.

**Steps:**
1. Log in as User 'A' while online and scroll through the main feed to load several posts.
2. Disable the internet connection (e.g., turn off Wi-Fi/data, use browser's offline mode).
3. Attempt to navigate back to the main feed or refresh the currently viewed feed.

**Expected Result:** The user should still be able to view the previously loaded posts on their feed. The application displays an indicator that it is currently offline.

---

## [TC020_002] View Own Profile While Offline
**Preconditions:** User 'A' has previously accessed the app online and viewed their profile.

**Steps:**
1. Log in as User 'A' while online and navigate to 'My Profile'.
2. Disable the internet connection.
3. Attempt to navigate back to 'My Profile'.

**Expected Result:** The user should still be able to view their previously loaded profile information (name, avatar, bio). The application displays an indicator that it is currently offline.

---

## [TC020_003] App Indicates Offline Status
**Preconditions:** The user is online and then loses internet connection.

**Steps:**
1. Log in to the app while online.
2. Disconnect from the internet.
3. Observe the application UI.

**Expected Result:** The application displays a clear visual indicator (e.g., a banner, icon, or text message) that the internet connection is lost and the app is in offline mode.

---

## [TC021_001] Minimized Initial App Load Time
**Preconditions:** The application is deployed and accessible. Browser cache is cleared.

**Steps:**
1. Open a fresh browser instance.
2. Navigate to the application URL for the first time.
3. Measure the time taken from navigation to the full rendering of the login/sign-up page.

**Expected Result:** The initial load time is minimized (e.g., under 3-5 seconds, depending on specific requirements). Static assets are loaded efficiently, potentially via caching mechanisms.

---

## [TC021_002] Nearly Instant Subsequent App Load Times
**Preconditions:** The application has been accessed at least once, and static assets are cached in the browser.

**Steps:**
1. Access the application (TC021_001 passed).
2. Close the tab/browser (do not clear cache).
3. Re-open the browser and navigate to the application URL again.
4. Measure the time taken to load.

**Expected Result:** Subsequent loads of the application are nearly instant (e.g., under 1-2 seconds), leveraging browser caching for static assets.

---

## [TC021_003] Quick Navigation Between App Sections
**Preconditions:** User is logged in.

**Steps:**
1. Log in as User 'A'.
2. Navigate between different sections (e.g., Feed, Profile, Friends List, Notifications).
3. Measure the time taken for each section to load fully.

**Expected Result:** Navigation between different authenticated sections of the app is quick and responsive, providing a smooth user experience.