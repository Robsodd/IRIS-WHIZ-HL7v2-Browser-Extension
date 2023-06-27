VERSION 1.5.1 - Developed by Rob Ellis @ Royal Devon University Healthcare NHS Foundation Trust

---- Description:

Originally created to make the differences between TEST and PRODUCTION instances more immediately obvious, features were added to enhance and make easier; message searching, message comparison and monitoring productions.

This web browser extension is best suited to Interface analysts working with HL7 v2 messages.

This code is made available as is and will not be supported. Please see License.txt for full details.



---- Installation & Set Up:

Follow the instructions in the tutorial video below:

https://youtu.be/cxpMFfGYGu0

Or

Download from GitHub: https://github.com/Robsodd/RDUH-Intersystems-HL7v2-Browser-Extension

Unzip the downloaded folder.

In your browser navigate to the extension settings. 

Enable developer mode.

This should enable an option to Load Unpacked extensions. 

Click this button and select the folder containing this extension, this should install and enable the extension.

Some features require that you build out your instances of Intersystems Ensemble/Iris and namespaces on the Options page, though not all.

To add your instances and namespaces navigate to the extensions options page. 
You can do this by going into your browser's extension manager and finding the options button. 
OR if you have pinned the extension to your taskbar, click it and then click the Options Page button that appears in the pop-up window.

Scroll down to the Instances form and add your instances and namespaces as needed. Each namespace you create will be associated with the instance that is currently showing in the instance form.

Click save after each instance / namespace added.

Finally, enable your desired features using the checkbox form at the top of this options page.



---- Features:

1. AutoTab
2. AutoTab - Namespaces
3. Instance Header Colours
4. Message Search
5. Open Session
6. Selected Messages Tab on Message Viewer Page
7. Share Link on Selected Messages Tab
8. Full Trace Tab on Visual Trace  Page
9. Import Message on HL7 Message Content Page
10. Copy Raw HL7 Text
11. Expand HL7 Schema
12. Compare HL7 Message Fields
13. Business Component Report
14. Open base64 string as PDF 
15. Add Bookmarks
16. Message Viewer Page - Order by Oldest
17. Message Viewer Page - Complete Date
18. Message Viewer Page - Extended Criteria Search History 



-- 1. AutoTab

Organises your tabs into coloured Tab Groups by Ensemble Instance for easy identification in the browser. Requires the instances object to have been built using the Instances tool in the extension options page.
This feature can help you to organise Test and Production instances into groups in your browser to prevent confusion.


-- 2. AutoTab - Namespaces

Further organises your Tab Groups into different Namespaces. Each Namespace shares its colour with its parent Instance. Requires the instances object to have been built using the Instances tool in the extension options page.


-- 3. Instance Header Colours

Colours your Instance headers for easier on-page identification of Instance. (So you don't get confused and accidentally change production when you're trying to test!) Requires the instances object to have been built using the Instances tool in the extension options page.
This feature can help you to easily differentiate between Test and Production instances at a glance.


-- 4. Message Search

Creates a context menu so you can right click on any hyperlinked message content in the Contents page in Message Viewer (Full Contents, not Raw) and create a search criterion based on that Message's schema. 
This works using timings so may not be useful on slower computers.
Highlight the message content to search for that content. If you don't highlight any text the Add Criterion window will autofill but stop so you can add your own value to search for.
Also works on the Visual Trace page in the Contents frame. Opens a new message search window and adds the criterion. Caution, the criterion from your previous Message Viewer search may automatically appear when opening Message Viewer from the Visual Trace page.


-- 5. Open Session

Opens the Visual Trace for the provided session ID. Found on the pop-up when you click the extension icon. *You must be on the correct namespace for the session ID you wish to search for.
Helpful for sharing a particular session with a team member or saving it for later. Potential use - save the session ID in the MSH segment of a HL7 message. Use this feature to navigate to the message quickly from a third party system.


-- 6. Selected Messages Tab on Message Viewer Page

View the HL7 content of each selected message on the Message Viewer Page. 
Makes comparing similar messages easier.


-- 7. Share Link on Selected Messages Tab

Click the Share Link button to copy a link to your clipboard that will open all of the currently selected messages in a new window. 
Useful for sharing a set of messages with a team member or saving a set of messages for later.


-- 8. Full Trace Tab on Visual Trace  Page

Shows the HL7 content for all currently visible HL7 messages in the visual trace. 
Useful for comparing input with output.


-- 9. Import Message on HL7 Message Content Page

Import a HL7 message from another open Message Content page. 
Useful for comparing messages across environments. E.g. Test with Production


-- 10. Copy Raw HL7 Text

Copies the raw HL7 text of the message to your clipboard.
Saves extra navigation to the RAW version of a message.


-- 11. Expand HL7 Schema

Clicking on the first two columns of any HL7 message (full content view) will expand down the Segment so you can see the values next to their schema description. Clicking the expand all button available on some pages will expand all Segments.
Can save you from having to navigate to the message's schema.


-- 12. Compare HL7 Message Fields

Hover your mouse over a HL7 message's field to perform a basic comparision with the other HL7 message fields on the current page. Click the SHOW LEGEND button on the Message Content page to see more details.
Helpful for checking transformations or comparing test messages with production.


-- 13. Business Component Report

On the %Sys namespace homepage shows all business componenets in active productions for the current instance that are not in a state of Active or Disabled. On each individual namespace homepage it shows only the business components for that particular namespace.
Enable or disable as needed on the options page.
Helpful for quickly checking any business components that and in error without cycling through all namespaces.
*I think this only works on Ensemble and not on IRIS

 
-- 14. Open base64 string as PDF 

Found on the pop-up when you click the extension icon for you to paste your base64 encode string into, or you can highlight the string with your mouse, right click and click 'Open as PDF' to convert the raw string to a PDF.
Helpful for checking messages with embedded PDFs.


-- 15. Bookmarks

Adds a 'TIE Links' folder of bookmarks for easy navigation to your instances and namespaces. If you edit your namespaces you'll need to delete the folder and refresh extension to create the bookmarks again. Requires the instances object to have been built using the Instances tool in the extension options page.
Helpful for speedy navigation to the correct instance/namespace.
*If you've added new namespaces you'll need to delete (or rename if you've added other bookmarks that you want to keep) the current bookmarks folder for a new one to be created.


-- 16. Message Viewer Page - Order by Oldest

Automatically updates the Order By option on the message viewer page to Oldest First. Enable on the options page.


-- 17. Message Viewer Page - Complete Date

Automatically updates the Time Format option on the message viewer page to Complete. Enable on the options page.


-- 18. Message Viewer Page - Extended Criteria Search History

Caches the Extended Criteria used when the Search button is clicked (up to 10 searches). 
Allows user to scroll through previous criteria and click them to add them back to the extended criteria section.
The history will contain the full HTML element object however only VDoc Segment Field, VDoc Property Path and Header criterion will automatically be applied to the current search criteria when clicked. 
Clicking incompatible criteria will result in an error message.
Useful if you've resubmitted a message and want to recall the criteria you used to find it in the first place.



---- Updates

06/06/2023 Updates:

Feature added: Message Viewer Page - Extended Criteria Search History 

Caches the Extended Criteria used when the Search button is clicked (up to 10 searches). Allows user to scroll through previous criteria and click them to add them back to the extended criteria section.
Should help when performing similar searches across test and production environments. 
