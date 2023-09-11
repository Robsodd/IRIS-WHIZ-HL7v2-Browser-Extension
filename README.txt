***
VERSION 1.7.0 - Developed by Rob Ellis @ Royal Devon University Healthcare NHS Foundation Trust

[![OEX](https://img.shields.io/badge/Available%20on-Intersystems%20Open%20Exchange-00b2a9.svg)](https://openexchange.intersystems.com/package/RDUH-Interface-Analyst-HL7v2-Browser-Extension) 

## Description:

Originally created to make the differences between TEST and PRODUCTION instances more immediately obvious, features were added to enhance and make easier; message searching, message comparison and monitoring productions.

This web browser extension is best suited to Interface analysts working with HL7 v2 messages.

This code is made available as is and will not be supported. Please see License.txt for full details.



## Installation & Set Up:

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


## Features:

#### Browser Based 
01. AutoTab
02. AutoTab - Namespaces
03. Instance Header Colours
15. Add Bookmarks


#### Right Click Context Menu
04. Message Search
14. Open base64 string as PDF 


#### Message Viewer Page
06. Selected Messages Tab
07. Share Link on Selected Messages Tab
16. Order by Oldest
17. Complete Date
18. Extended Criteria Search History 
19. Share Search


#### Visual Trace Page
08. Full Trace Tab
21. Show Related Messages Button
22. Hide Unrelated Messages Button
23. FullTrace Messages Link to their SVG counterpart

#### Message Content Page
09. Import HL7 Message from another Message Content Page


#### Various Pages (feature exists on more than one page)
10. Copy Raw HL7 Text
11. Expand & Search HL7 Schema   (was Expand HL7 Schema)
12. Compare HL7 Message Fields
20. Multiple Message Scroll


#### Home Page 
13. Business Component Report


#### Extension Pop-up
05. Extension Pop-up - Open Session         
14. Open base64 string as PDF 


## Feature Descriptions:


#### 01. AutoTab

Organises your tabs into coloured Tab Groups by Ensemble Instance for easy identification in the browser. Requires the instances object to have been built using the Instances tool in the extension options page.
This feature can help you to organise Test and Production instances into groups in your browser to prevent confusion.


#### 02. AutoTab - Namespaces

Further organises your Tab Groups into different Namespaces. Each Namespace shares its colour with its parent Instance. Requires the instances object to have been built using the Instances tool in the extension options page.


#### 03. Instance Header Colours

Colours your Instance headers for easier on-page identification of Instance. (So you don't get confused and accidentally change production when you're trying to test!) Requires the instances object to have been built using the Instances tool in the extension options page.
This feature can help you to easily differentiate between Test and Production instances at a glance.


#### 04. Message Search

Creates a context menu so you can right click on any hyperlinked message content in the Contents page in Message Viewer (Full Contents, not Raw) and create a search criterion based on that Message's schema. 
This works using timings so may not be useful on slower computers.
Highlight the message content to search for that content. If you don't highlight any text the Add Criterion window will autofill but stop so you can add your own value to search for.
Also works on the Visual Trace page in the Contents frame. Opens a new message search window and adds the criterion. Caution, the criterion from your previous Message Viewer search may automatically appear when opening Message Viewer from the Visual Trace page.


#### 05. Open Session

Opens the Visual Trace for the provided session ID. Found on the pop-up when you click the extension icon. *You must be on the correct namespace for the session ID you wish to search for.
Helpful for sharing a particular session with a team member or saving it for later. Potential use - save the session ID in the MSH segment of a HL7 message. Use this feature to navigate to the message quickly from a third party system.


#### 06. Selected Messages Tab on Message Viewer Page

View the HL7 content of each selected message on the Message Viewer Page. 
Makes comparing similar messages easier.


#### 07. Share Link on Selected Messages Tab

Click the Share Link button to copy a link to your clipboard that will open all of the currently selected messages in a new window. 
Useful for sharing a set of messages with a team member or saving a set of messages for later.


#### 08. Full Trace Tab on Visual Trace  Page

Shows the HL7 content for all currently visible HL7 messages in the visual trace. 
Useful for comparing input with output.


#### 09. Import Message on HL7 Message Content Page

Import a HL7 message from another open Message Content page. 
Useful for comparing messages across environments. E.g. Test with Production


#### 10. Copy Raw HL7 Text

Copies the raw HL7 text of the message to your clipboard.
Saves extra navigation to the RAW version of a message.


#### 11. Expand & Search HL7 Schema (was Expand HL7 Schema)

Clicking on the first two columns of any HL7 message (full content view) will expand down the Segment so you can see the values next to their schema description. 

When clicked the Search Schema button is replaced with a search bar and all schema for currently visible messages is expanded. Use the search bar to hide schema fields that don't match the current search text.
Empty the search bar and press enter to close all expanded schema.

Can save you from having to navigate to the message's schema and helps search through messages.


#### 12. Compare HL7 Message Fields

Hover your mouse over a HL7 message's field to perform a basic comparision with the other HL7 message fields on the current page. Click the SHOW LEGEND button on the Message Content page to see more details.
Helpful for checking transformations or comparing test messages with production.


#### 13. Business Component Report

On the %Sys namespace homepage shows all business componenets in active productions for the current instance that are not in a state of Active or Disabled. On each individual namespace homepage it shows only the business components for that particular namespace.
Enable or disable as needed on the options page.
Helpful for quickly checking any business components that and in error without cycling through all namespaces.
*I think this only works on Ensemble and not on IRIS

 
#### 14. Open base64 string as PDF 

Found on the pop-up when you click the extension icon for you to paste your base64 encode string into, or you can highlight the string with your mouse, right click and click 'Open as PDF' to convert the raw string to a PDF.
Helpful for checking messages with embedded PDFs.


#### 15. Bookmarks

Adds a 'TIE Links' folder of bookmarks for easy navigation to your instances and namespaces. If you edit your namespaces you'll need to delete the folder and refresh extension to create the bookmarks again. Requires the instances object to have been built using the Instances tool in the extension options page.
Helpful for speedy navigation to the correct instance/namespace.
*If you've added new namespaces you'll need to delete (or rename if you've added other bookmarks that you want to keep) the current bookmarks folder for a new one to be created.


#### 16. Message Viewer Page - Order by Oldest

Automatically updates the Order By option on the message viewer page to Oldest First. Enable on the options page.


#### 17. Message Viewer Page - Complete Date

Automatically updates the Time Format option on the message viewer page to Complete. Enable on the options page.


#### 18. Message Viewer Page - Extended Criteria Search History

Caches the Extended Criteria used when the Search button is clicked (up to 10 searches). 
Allows user to scroll through previous criteria and click them to add them back to the extended criteria section.
The history will contain the full HTML element object however only VDoc Segment Field, VDoc Property Path and Header criterion will automatically be applied to the current search criteria when clicked. 
Clicking incompatible criteria will result in an error message.
Useful if you've resubmitted a message and want to recall the criteria you used to find it in the first place.

#### 19. Message Viewer Page - Share Search

Creates a 'Share Search' button on the Message Viewer page. 
When clicked, the current search criteria is saved in the Saved Searches and the current URL with the Saved Search's name appended as a query param is copied to the clipboard.
Navigate to this new URL and it will automatically open the saved search. The browser prompts you to delete the saved search - this is so your Saved Searches dropdown doesn't get filled, though you don't have to delete the Saved Search if you don't want to.
Saved Searches are the current datetime prepended with zz.
Useful for sharing search results with colleages.

#### 20. Multiple Message Scroll

When viewing any page where the extension has added multiple messages and there are horizontal scrollbars, hold CTRL and then scroll. This will scroll all message scrollbars at the same time.
Useful for comparing multiple messages at the same time.


#### 21. Show Related Messages Button

In the visual trace tab/FullTrace tab highlights messages in red that are directly related via the start or end icons on the SVG trace window to the currently selected message
Hides messages in the FullTrace tab that are not related to this message

*Note this is a best estimate based on the start and end position of each message. For simple traces this will work fine, however it may fall down on more complicated traces where multiple messages are triggered from the same processor to the same operation and responses are sent back.


#### 22. Hide Unrelated Messages Button

When the Show Related Messages button is active this button appears. When clicked it will attempt to hide any messages in the SVG window that aren't highlighted. 
Intended to reduce visual clutter when viewing the SVG page.


#### 23. FullTrace Messages Link to their SVG counterpart

Messages in the FullTrace tab are now linked to their SVG equivalent in the Visual Trace frame. Click either and it clicks its partner. Hover over one and it and its partner will change colour slightly.

This is to allow you to more easily see which message is which when there are dozens of messages. For example, an ADT feed sending to multiple systems.



## Updates


##### 11/09/2023 Updates:

__Feature added: Show Related button - Visual Trace page__

Uses the selected message in the visual trace tab/FullTrace tab as a start location
Highlights messages in red that are directly related via the start or end icons on the SVG trace window
Hides messages in the FullTrace tab that are not related to this message
*Note this is a best estimate based on the start and end position of each message. For simple traces this will work fine, however it may fall down on more complicated traces where multiple messages are triggered from the same processor to the same operation and responses are sent back.


__Feature Added: Ctrl+Click message__

Ctrl clicking on a message's background in the FullTrace tab will scroll that message into view in the visual trace window


__General Visual Trace page features added:__

Messages in the FullTrace tab are now linked to their SVG equivalent in the Visual Trace frame. Click either and it clicks its partner. However over one and it and its partner will change colour slightly.
This is to allow you to more easily see which message is which when there are dozens of messages. For example, an ADT feed.


__Feature Added: Searchable Schema (individual segments & all)__

Expanding an individual segment to view its schema will now include a search bar. Type into this search bar to hide schema rows that don't include your typed text.
Use the button bar's Search Schema button to expand all currently available schema and replace the Search Schema button with a Search Bar. Clear the search bar and press ENTER to close this Search Bar and the expanded schema.
The individual segment's search bar won't appear when you click the button bar Search Schema button unless it was already open for that segment when you clicked Search Schema or you close and open an individual segment's Schema. Only the latest search made will apply to any segment with an individual search bar. When closing and reopening searches, no search is saved.


__Bugfix__: Blue.css file .css extension missing. Not sure where it went but it's back now and I'll do my best to keep it here.
__Bugfix__: Empty segments break the schema expansion. Now they will have to find another way to ruin your day.
__BugFix__: New Search History item appears when deleting one. Sometimes a search would rise from the ashes when deleting an old search. This Phoenix has been dealt with by the appropriate wizards.
__BugFix__: I thought changing the way buttons worked would be a good idea. It wasn't.
__BugFix__: Searches without criteria break the Search History. Now, if you feel so inclined, you can search without criteria and it should still function as intended.




##### 22/08/2023 Updates:

__Feature Added: Share Search__

Creates a 'Share Search' button on the Message Viewer page. 
When clicked, the current search criteria is saved in the Saved Searches and the current URL with the Saved Search's name appended as a query param is copied to the clipboard.
Navigate to this new URL and it will automatically open the saved search. The browser prompts you to delete the saved search - this is so your Saved Searches dropdown doesn't get filled, though you don't have to delete the Saved Search if you don't want to.
Saved Searches are the current datetime prepended with zz.
Useful for sharing search results with colleages.


__Feature Added: Multiple Message Scroll__

When viewing any page where the extension has added multiple messages and there are horizontal scrollbars, hold CTRL and then scroll. This will scroll all message scrollbars at the same time.
Useful for comparing multiple messages at the same time.


__BugFix__: Search History no longer empties prematurely.
__BugFix__: Search History no longer breaks the Message Viewer page's extension funcitonality if opened before first search is performed.


##### 06/06/2023 Updates:

__Feature added: Message Viewer Page - Extended Criteria Search History__

Caches the Extended Criteria used when the Search button is clicked (up to 10 searches). Allows user to scroll through previous criteria and click them to add them back to the extended criteria section.
Should help when performing similar searches across test and production environments. 
