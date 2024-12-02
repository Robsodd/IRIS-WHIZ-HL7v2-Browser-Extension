***
VERSION 1.10.0 - Developed by Rob Ellis @ Royal Devon University Healthcare NHS Foundation Trust

[![OEX](https://img.shields.io/badge/Available%20on-Intersystems%20Open%20Exchange-00b2a9.svg)](https://openexchange.intersystems.com/package/RDUH-Interface-Analyst-HL7v2-Browser-Extension) 

## Description:

Originally created to make the differences between TEST and PRODUCTION instances more immediately obvious, features were added to enhance and make easier; message searching, message comparison and monitoring productions.

This web browser extension is best suited to Interface analysts working with HL7 v2 messages.

This code is made available as is and will not be supported. Please see License.txt for full details.



## Installation & Set Up:

Follow the instructions in the tutorial video below:

https://youtu.be/cxpMFfGYGu0

Or

Download from GitHub: https://github.com/Robsodd/IRIS-WHIZ-HL7v2-Browser-Extension

Unzip the downloaded folder.

In your browser navigate to the extension settings. 

Enable developer mode.

This should enable an option to Load Unpacked extensions. 

Click this button and select the folder containing this extension, this should install and enable the extension.

Some features require that you build out your instances of Intersystems Ensemble/Iris and namespaces on the Options page, though not all.

To add your instances and namespaces navigate to the extensions options page. 
You can do this by going into your browser's extension manager and finding the options button. 
OR if you have pinned the extension to your taskbar, click it and then click the Options Page button that appears in the pop-up window.

Scroll down to the Instances table and add your instances. Click the namespace cell to open the pop-up namespace table. Each namespace you create will be associated with the instance that is showing in title of the namespace form.

Instances and Namespaces save automatically when you click off the field being edited.

Finally, enable your desired features using the checkbox form at the top of this options page.


## Features:

#### Browser Based 
01. AutoTab
02. AutoTab - Namespaces
03. Instance Header Colours
15. Add Bookmarks
30. Custom Colours


#### Right Click Context Menu
04. Message Search
14. Open base64 string as PDF 
31. Custom Page Titles & Saved Pages



#### Message Viewer Page
06. Selected Messages Tab
07. Share Link on Selected Messages Tab
16. Order by Oldest
17. Complete Date
18. Extended Criteria Search History 
19. Share Search
33. ChartJS Analysis Page


#### Visual Trace Page
08. Full Trace Tab
21. Show Related Messages Button
22. Hide Unrelated Messages Button
23. FullTrace Messages Link to their SVG counterpart

#### Message Content Page
09. Import HL7 Message from another Message Content Page
28. Schema Mode


#### Various Pages (feature exists on more than one page)
10. Copy Raw HL7 Text
11. Expand & Search HL7 Schema   (was Expand HL7 Schema)
12. Compare HL7 Message Fields
20. Multiple Message Scroll
26. Segment Search
27. Hide Iris Whiz Buttons Until Needed
29. Splitscreen Comparisons


#### Home Page 
13. Business Component Report


#### Production Page
24. ChatGPT Powered Test Message Generator
25. Active Production Category Search
32. Production Queue Search

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
Empty the search bar and press enter to close all expanded schema. Press enter to highlight matching copy in the message.

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

Adds a 'TIE Links' folder of bookmarks for easy navigation to your instances and namespaces. If you edit your namespaces you'll need to delete the folder and rename it in the settings to create the bookmarks again. Requires the instances object to have been built using the Instances tool in the extension options page.
Helpful for speedy navigation to the correct instance/namespace.

Update the folder name in the settings to recreate the bookmark folder with your desired name. I've not auto-deleted the old one in case people add other bookmarks to this folder. You have been warned.


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


#### 24. ChatGPT Powered Test Message Generator

Use ChatGPT to generate you a test HL7 message. The prompt will appear on the Test window on the production page as long as you have input an API Key to the ChatGPT API key setting of the Options page.

You need to select a schema and a doc type and it will automatically generate you a prompt. Edit the prompt as you please and then click the Generate to call ChatGPT. 


#### 25. Active Production Category Search

On productions a button appears next to the Category dropdown. Clicking this button loads active productions onto the page, gathers their category lists and complies them into a dropdown. Choosing a category from this dropdown will cause all productions with matching categories to show on the page with this Category filter applies to them. Any categories on the starting production page are prefixed with *. This is for ease of identification. Choosing a category that is not on the starting production page will not update the starting production page.

Note it only shows ACTIVE productions. That is, productions shown as Running on your %SYS homepage.

This is useful for seeing workflows for a particular category across namespaces. It's a little slow if you have a lot of productions, but it works pretty well. 


#### 26.  Segment Search

Hide segments that don't match your current search criteria. You can search specific segments by prepending your search with \SEGMENT\YOUR SEARCH HERE
e.g. 
\OBX\151570

Bonus points if you know which Rosetta Terminology vitals that references.

That example will only hide OBX segments, leaving other segments still visible. Useful for searching for specific OBX-3 values but leaving the OBR/PID/MSH etc.. segments showing. 

Please remember to use back slashes. This also renders back slashes useless for search purposes. Sorry.


#### 27. Hide Iris Whiz Buttons Until Needed

Added an IRIS WHIZ button to maximise/minimise the button bar as needed. This is the bar that appears on Full Trace tab, Message Contents Tab and Selected Messages Tab and contains Text Compare, Schema Search etc.

Choose on the option page whether you want the button bar to be expanded on page load. Default is buttons are hidden. It also looks more fancy now. You're welcome.



#### 28. Schema Mode

Toggle the Schema Mode using the… Schema Mode button! 

Default behaviour for expanding schema only shows the known schema that is available in the Title of the field - the bit where you hover your mouse over the fields. 

Toggle the button and it will look up the schema using the link in the segment element. This is slow, especially when used in conjunction with the Searching features. Therefore I've limited it to the Contents view. WARNING! It will continue to work if you import messages to this view. Unless you like to watch the world burn, don't use the Full Schema option if you have many messages imported into your page. 


#### 29. Splitscreen Comparisons

Click the green splitscreen button to see messages side by side.  The splitscreen option is only available where the screensize can become roughly full screen.

This feature makes it easier to compare longer messages on the same screen.


#### 30. Custom Colours

Create and apply custom header colours to Instances and Namespaces. 

Set the background, backup background (for use when trying to do gradient background colours and sharing instances objects across a team using different browsers), text colour and link colour. 

To overwrite one of the default colours create a new colour with the same name. 


#### 31. Custom Page Titles & Saved Pages

Added a right click menu item on all pages to change the current page title. Useful if you've got several message pages open so you can differentiate easily via the tab name.

Changing a page title saves the page in searchable local storage so you can open it again later. Click the extension's icon to view the saved pages section. 

This is useful if you have multiple message tabs open and want to easily differentiate between them.


#### 32. Production Queue Search

Added a search bar to the Queue tab on the production page. Allows you to search queuing componenets. Clicking the table header will order the table by that column.  Defaults to sorting by Count of queue.

Useful to see queues quickly compared with scrolling because ain't nobody got time for that.


#### 33. ChartJS Analysis Page

An Analyse button now appears on message viewer page. This opens the results of your search in a new tab and shows you the data in some default ChartJS pie charts and a main message timeline.

Pan (click and drag), zoom in (mouse wheel) and change the date range (radio list of options) on the main timeline chart. Click a block on the chart to show the corresponding message in the Selected Messages box. Click the View Selected Messages button to open the listed messages in a new window for easy comparison.

Click Pie Chart segments to show the messages in the clicked segment in the Selected Data Segment box. Toggle the filter button at the top of this box to filter all charts down to only this selected data, including the timeline chart.

Click the View On Timeline button on any pie chart to see the data for that pie chart displayed on the TimeLine chart.

Any criteria you have added to your message search will appear as piecharts at the bottom of the page. 

Toggle fullscreen mode on any chart with its corresponding 'Fullscreen' button.

Drag the sidebar as needed to view either the data or the charts more easily.

This page is useful for diving into your data. I hope.




#### 34. Queue Refresh

Iris saw the demise of the auto-refresh button on the production Queue page. I have given it life again. 

Select the refresh interval in the dropdown.

Useful if you don't have a desire to repeatedly click a refresh button.


#### 35. Export Search as CSV

On the Message Viewer page you can click the Iris Whiz Export button to download a CSV copy of the data currently in your search table.

Useful if you want to do analysis on your data but don't want to use the fancy new Chart.JS page I spent ages creating.


#### 36. 


## Updates

##### 18/11/2024 Updates:

Version 1.10.0


__Feature Added__: ChartJS Analysis

An Analyse button now appears on message viewer page. This opens the results of your current search in a new tab and shows you the data in some default ChartJS pie charts and a main message timeline.

Thanks to the creators of the following libraries I used:
Chart.js v4.4.5
https://www.chartjs.org
(c) 2024 Chart.js Contributors
Released under the MIT License

chartjs-adapter-date-fns v3.0.0
https://www.chartjs.org
(c) 2022 chartjs-adapter-date-fns Contributors

chartjs-plugin-datalabels v2.2.0
https://chartjs-plugin-datalabels.netlify.app
(c) 2017-2022 chartjs-plugin-datalabels contributors
Released under the MIT license

chartjs-plugin-zoom v2.0.1
(c) 2016-2023 chartjs-plugin-zoom Contributors
Released under the MIT License

Hammer.JS - v2.0.8 - 2016-04-23
http://hammerjs.github.io/
Copyright (c) 2016 Jorik Tangelder;
Licensed under the MIT license


__Feature Added__: Queue refresh

Iris now has an auto refresh dropdown for the Queues page. Will refresh the queue at the interval selected. Does not load on Ensemble as it already has this feature.

__Feature Added__: Export Search as CSV

On the Message Viewer page you can click the Iris Whiz Export button to download a CSV copy of the data currently in your search table.

Useful if you want to do quick analysis on your data but don't want to use the fancy new Chart.JS page I spent ages creating.


__Bug Fix__: Hide Related

Hide related button going for walkies.


__Feature Updated__: TraceViewer

Clickable area to highlight the message in the FullTrace tab was tiny. Now it's all of the background area.


__Feature Updated__: Saved Searches

Saved Searches now automatically use Body Property Criterion Type if RawContent is found in the text values. 

__Feature Updated__: Expand Schema

Expand Schema buttons now highlight on hover. Also now square to prevent them messing the visual of the message. 




## Updates

##### 26/11/2024 Updates:

Version 1.9.1

__Feature Added__: Production Queue Search

Added a search bar to the Queue tab on the production page. Allows you to search queuing componenets. Clicking the table header will order the table by that column.  Defaults to sorting by Count of queue.



## Updates

##### 27/01/2024 Updates:

Version 1.9.0


__Option Added__: Enable Text Compare as default.

New setting on options page to enable text compare without having to toggle the button.


__Feature Added__: Splitscreen Comparisons

A green button now appears on messages when the splitscreen option is available. This allows you to see messages side by side making it easier to compare longer messages.


__Feature Added__: Custom Colours

Create and apply custom header colours to Instances and Namespaces. 

Set the background, backup background (for use when trying to do gradient background colours and sharing instances objects across a team using different browsers), text colour and link colour. 

To overwrite one of the default colours create a new colour with the same name. 


__Feature Added__: Custom Page Titles & Saved Pages

Added a right click menu item on all pages to change the current page title. Useful if you've got several message pages open so you can differentiate easily via the tab name.

Changing a page title saves the page in searchable local storage so you can open it again later. Click the extension's icon to view the saved pages section. 

This is useful if you have multiple message tabs open and want to easily differentiate between them.



__Feature Updated__: Instances & Namespaces:

Updated from a form to a table so that you can easily see your instance & namespace setup while editing. Automatically saves as you're editing so no need to click a save button anymore.


__Feature Updated__: Settings:

Automatically saves as you're editing so no need to click a save button anymore.


__Feature Updated__: Whiz Button Bar

Restructured buttons into roughly related groups to make it easier to read. I'm not sure about it. Let me know what you think!



##### 11/10/2023 Updates:

Version 1.8.0

__Feature Updated__:

Stored instances export now includes all current settings. You can still import your old instances object, it will be immediately updated to the new version on import. Save this somewhere safe! This was probably more work than it was worth.

__Behaviour Change__: Bookmark folder is not automatically created. Now gets created when editing the settings according to the name chosen in the new Bookmark Folder Name setting. Yes, it is very fancy now.

__Bugfix__: Rule editor in Iris does not have coloured header. This now highlights. Excellent. 

__Feature Added__: ChatGPT Powered Test Message Generator.

When sending a test message on a production page you can now use ChatGPT to generate you a HL7 message. The prompt will appear as long as you have input an API Key to the ChatGPT API key setting of the Options page.

You need to select a schema and a doc type and it will automatically generate you a prompt. Edit the prompt as you please and then click the Generate to call ChatGPT. 


__Feature Added__: On Schema search you can now press enter to highlight matching copy. 

Highlighting the text on keypress proved too slow when several messages were open and highlighting on enter seemed an acceptable compromise. Enter remains the exit key when the search bar is blank. 

When searching individual segments text is automatically highlighted. Segment search highlighting takes priority sometimes, depends how it's feeling.


__Feature Added__: Active Production Category Search

On productions a button appears next to the Category dropdown. Clicking this button loads active productions onto the page, gathers their category lists and complies them into a dropdown. Choosing a category from this dropdown will cause all productions with matching categories to show on the page with this Category filter applies to them. Any categories on the starting production page are prefixed with *. This is for ease of identification. Choosing a category that is not on the starting production page will not update the starting production page.

Note it only shows ACTIVE productions. That is, productions shown as Running on your %SYS homepage.

This is useful for seeing workflows for a particular category across namespaces. It's a little slow if you have a lot of productions, but it works pretty well. 


__Feature Added__: Segment Search.

Hide segments that don't match your current search criteria. You can search specific segments by prepending your search with \SEGMENT\YOUR SEARCH HERE
e.g. 
\OBX\151570

Bonus points if you know which Rosetta Terminology vitals that references.

That example will only hide OBX segments, leaving other segments still visible. Useful for searching for specific OBX-3 values but leaving the OBR/PID/MSH etc.. segments showing. 

Please remember to use back slashes. This also renders back slashes useless for search purposes. Sorry.


__Feature Added__: Hide Iris Whiz Buttons Until Needed

Added an IRIS WHIZ button to maximise/minimise the button bar as needed. This is the bar that appears on Full Trace tab, Message Contents Tab and Selected Messages Tab and contains Text Compare, Schema Search etc.

Choose on the option page whether you want the button bar to be expanded on page load. Default is buttons are hidden. It also looks more fancy now. You're welcome.


__Feature Added__: Bookmark Folder Name setting

A new text input in the settings adds ability to recreate the bookmark folder with your desired name. I've not auto-deleted the old one in case people add other bookmarks to this folder. You have been warned.


__Feature added__: Schema Mode on Message Contents pages.

You can now toggle Schema Mode using the… Schema Mode button! The current behaviour for expanding schema only shows the known schema that is available in the Title of the field - the bit where you hover your mouse over the fields. The new version can look up the schema using the link in the segment element. This is slow, especially when used in conjunction with the Searching features. Therefore I've limited it to the Contents view. WARNING! It will continue to work if you import messages to this view. Unless you like to watch the world burn, don't use the Full Schema option if you have many messages imported into your page. 


__Update__: Minor speed increases. Nobody will notice. Yay.


##### 12/09/2023 Updates:

Version 1.7.1

__BugFix__:
Header/Body/ContentsTrace tabs does not reappear if they were the last thing and first thing clicked on after clicking on Selected Messages/FullTrace tabs. This is fixed. Hoozah! Thanks for the feedback Anonymous reviewer

__Updated Legend__:
Legend now closes on most clicks outside/on the legend. Some pages contain other iframes where it's not possible for clicks to close it. I think it's good enough as is. Hide Legend button still appears for ease of use. 
Legend also now styled a bit better. May be tough to see on smaller screens but I think the ease of use outweighs this issue. Again, thanks for the feedback Anonymous reviewer! Don't be afraid to update your review :D

To update, copy your instance object from the options screen, download the latest version and paste your instance object back into the options page.


##### 11/09/2023 Updates:

Version 1.7.0

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

Version 1.6.0

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
