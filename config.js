// config.js

// ==========================================
// 1. GLOBAL SETTINGS
// Settings that apply to the background script, not a page specific script.
// ==========================================
const globalSettings = [
    { id: "AutoTab", category: "All Pages", type: "checkbox", label: "Auto Tab Groups", desc: "Organises your tabs into coloured Tab Groups by Ensemble Instance for easy identification in the browser.", default: false },
    { id: "AutoTabNameSpace", category: "All Pages", type: "checkbox", label: "Auto Tab Namespace", desc: "Further organises your Tab Groups into different Namespaces. Each Namespace shares its colour with its parent Instance.", default: false },
    { id: "BookmarkFolderName", category: "All Pages", type: "text", label: "Bookmark Folder Name", desc: "Name of the folder to save IRIS bookmarks in. Creates a folder of links for speedy navigation to your configured instances and namespaces.", default: "" }
];

// ==========================================
// 2. SCRIPT DEFINITIONS & NESTED FEATURES
// The root object creates the Master On/Off Toggle for the script.
// The "options" array holds any specific settings for that script.
// ==========================================
const scriptDefinitions = {
    messageSearch: {
        id: "message_search",
        label: "Message Search",
        desc: "Adds a right-click context menu to message content to quickly build search criteria in the Message Viewer. Also works from Visual Trace.",
        category: "Right Click Context Menu",
        default: true,
        js: ["content_scripts/message_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal*"],
        excludePaths: ["/csp/*/EnsPortal.ProductionConfig.zen*"],
        options: []
    },
    schemaExpansion: {
        id: "schema_expansion",
        label: "Schema Expansion",
        desc: "Expands HL7 schemas inline on the message contents page. Includes a search bar to filter fields and a 'Schema Mode' toggle to look up full schema details.",
        category: "Message",
        default: true,
        js: ["content_scripts/schema_expansion.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*"
        ],
        options: []
    },
    segmentSearch: {
        id: "segment_search",
        label: "Segment Search",
        desc: "Adds a search bar to filter and hide segments that don't match your text. Prepend search with \\SEGMENT\\ to target specific segment types (e.g., \\OBX\\).",
        category: "Message",
        default: true,
        js: ["content_scripts/segment_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*"
        ],
        options: []
    },
    textCompare: {
        id: "text_compare",
        label: "Text Compare",
        desc: "Adds a side-by-side splitscreen comparison for messages, and allows hovering over fields to quickly compare values with other messages on the page.",
        category: "Message",
        default: true,
        js: ["content_scripts/text_compare.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&text_compare=disable*"
        ],
        options: [
            { id: "TextCompareOn", type: "checkbox", label: "Enable by Default", desc: "Automatically enable text comparison on load.", default: false }
        ]
    },
    copyRawText: {
        id: "copy_raw_text",
        label: "Copy Raw Text Button",
        desc: "Adds a button to instantly copy the raw HL7 payload to your clipboard, saving you a trip to the RAW=1 page.",
        category: "Message",
        default: true,
        js: ["content_scripts/copy_raw_text.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&copy_raw_text=disable*"
        ],
        options: []
    },
    traceViewer: {
        id: "trace_viewer",
        label: "Full Trace",
        desc: "Adds a Full Trace tab showing all HL7 payloads at once. Messages link directly to their SVG nodes, and includes tools to highlight or hide related messages.",
        category: "Visual Trace",
        default: true,
        js: ["content_scripts/trace_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.VisualTrace.zen?SESSIONID=*"],
        options: []
    },
    messageViewer: {
        id: "message_viewer",
        label: "Message Viewer Enhancements",
        desc: "Enhances Message Viewer with a 'Selected Messages' tab for comparison, and auto-applies 'Oldest First' sorting or 'Complete' time formatting based on your settings.",
        category: "Message Viewer",
        default: true,
        js: ["content_scripts/message_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"],
        options: [
            { id: "MVSortOrder", type: "checkbox", label: "Sort Oldest First", desc: "Forces the Message Viewer to load oldest messages first.", default: false },
            { id: "MVTimeFormat", type: "checkbox", label: "Show Complete Time", desc: "Forces the Message Viewer to show complete timestamps.", default: false }
        ]
    },
    messageviewerExport: {
        id: "messageviewerExport",
        label: "Message Viewer Export",
        desc: "Adds an 'Export' button to download the current Message Viewer search results directly as a CSV file.",
        category: "Message Viewer",
        default: true,
        js: ["content_scripts/message_viewer_export.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"],
        options: []
    },
    criteriaCache: {
        id: "criteria_cache",
        label: "Criteria Cache",
        desc: "Caches your recent Extended Criteria searches in a clickable history dropdown, making it easy to rerun complex searches later.",
        category: "Message Viewer",
        default: true,
        js: ["content_scripts/criteria_cache.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"],
        options: [
            { id: "CriteriaCacheArchiveDays", type: "number", label: "Archive Days", desc: "Maximum days to store entries in the cache.", default: 30, min: 1, max: 90 }
        ]
    },
    shareMessages: {
        id: "share_messages",
        label: "Share Messages",
        desc: "Generates a shareable link that opens all currently selected messages in a new window for easy sharing with colleagues.",
        category: "Message Viewer",
        default: true,
        js: ["content_scripts/share_messages.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&share=1*"],
        options: []
    },
    componentReport: {
        id: "component_report",
        label: "Component Report",
        desc: "Shows a health report on your %SYS homepage of all non-running/disabled business components across namespaces, or per-namespace on their respective homepages.",
        category: "Management Portal Home",
        default: true,
        js: ["content_scripts/component_report.js"],
        allFrames: false, 
        paths: [
            "/csp/sys/%25CSP.Portal.Home.zen*",
            "/csp/sys/UtilHome.csp"
        ],
        excludePaths: ["/csp/*/*disableComponentReport=true"],
        options: [
            { id: "HomepageReports", type: "checkbox", label: "Show Homepage Reports", desc: "Embed the reports directly onto the main homepage.", default: false }
        ]
    },
    pdfViewer: {
        id: "pdf_viewer",
        label: "Inline PDF Viewer",
        desc: "Adds a right-click context menu to instantly convert and render base64 encoded strings as an inline PDF.",
        category: "Right Click Context Menu",
        default: true,
        js: ["content_scripts/pdf_viewer.js"],
        allFrames: true,
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: []
    },
    saveMessageViewer: {
        id: "save_message_viewer",
        label: "Share Message Viewer State",
        desc: "Adds a 'Share Search' button that saves your current criteria and copies a direct URL to your clipboard to share the exact search results.",
        category: "Message Viewer",
        default: true,
        js: ["content_scripts/save_message_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"],
        options: []
    },
    utils: {
        id: "utils",
        label: "Core Utilities Engine",
        desc: "Shared global functions. (Required for most extension features to function properly).",
        category: "Hide",
        default: true,
        js: ["utils.js"],
        allFrames: true,
        runAt: "document_start",
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: []
    },
    namespaceCategorySearch: {
        id: "namespaceCategorySearch",
        label: "Namespace Category Search",
        desc: "Adds a cross-namespace Category Search button to find active productions by category, and alphabetizes the category dropdown for easier reading.",
        category: "Production Configuration",
        default: true,
        js: ["content_scripts/namespace_category_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.ProductionConfig.zen*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: []
    },
    productionQueue: {
        id: "productionQueue",
        label: "Production Queue Table Update",
        desc: "Adds a search bar to the Queue tab on the Production page to quickly filter queuing components, plus click-to-sort column headers.",
        category: "Production Configuration",
        default: true,
        js: ["content_scripts/production_queue.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.ProductionConfig.zen*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: []
    },
    queueRefresh: {
        id: "queueRefresh",
        label: "Queue Auto-Refresh",
        desc: "Restores the auto-refresh functionality to the Queues and Messages tabs on the Production page with customizable refresh intervals.",
        category: "Production Configuration",
        default: true,
        js: ["content_scripts/queue_refresh.js"],
        allFrames: true,
        paths: [
            "/*/EnsPortal.Queues.zen*", 
            "/*/EnsPortal.Queues.cls*"
        ],
        options: []
    },
    customCss: {
        id: "customCSS",
        label: "Inject Custom Theme CSS",
        desc: "Applies customized styles to the IRIS interface. Turning this off will break some things.",
        category: "Hide",
        default: true,
        css: ["css/custom.css"],
        allFrames: true,
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: [
            { id: "CSS", type: "checkbox", label: "Enable Custom CSS File", desc: "Allow injection of local custom.css.", default: true }
        ]
    },
    buttonCss: {
        id: "buttonCSS",
        label: "Custom Button Styles",
        desc: "Injects standardized button styles and groups them into a collapsible IRIS WHIZ menu bar to keep the UI clean until needed.",
        category: "Message",
        default: true,
        css: ["css/button.css"],
        allFrames: true,
        paths: ["/csp/*"],
        options: [
            { id: "ButtonsShow", type: "checkbox", label: "Show Quick Action Buttons", desc: "Render the quick action UI elements.", default: true }
        ]
    },
    customColours: {
        id: "customColours",
        label: "Apply Instance Colours",
        desc: "Applies your user-defined custom header colours to differentiate Instances (e.g., Test vs. Prod) and Namespaces.",
        category: "All Pages",
        default: true,
        js: ["content_scripts/custom_css.js"],
        allFrames: true,
        runAt: "document_start",
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"],
        options: []
    },
    pageTitles: {
        id: "pageTitles",
        label: "Dynamic Page Titles",
        desc: "Adds a right-click menu to dynamically rename browser tabs and saves them in local storage, accessible via the extension popup.",
        category: "Right Click Context Menu",
        default: true,
        js: ["content_scripts/page_titles.js"],
        allFrames: false, 
        paths: ["/csp/*"],
        options: []
    },
    analysis: {
        id: "analysis",
        label: "Chart Analysis",
        desc: "Adds a full ChartJS Analysis page and a Quick Analysis tab to visualize Message Viewer search results with timelines and interactive pie charts.",
        category: "Message Viewer",
        default: true,
        js: [
            "chartjs/chart.umd.js",
            "chartjs/chartjs-adapter-date-fns.bundle.min.js",
            "chartjs/chartjs-plugin-datalabels.min.js",
            "chartjs/hammer.min.js",
            "chartjs/chartjs-plugin-zoom.min.js",
            "content_scripts/analysis.js"
        ],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"],
        options: []
    },
    prettify: {
        id: "prettify",
        label: "Code Prettifier",
        desc: "Beautifies raw XML and JSON payloads for readability. (Includes toggle between raw and prettified views).",
        category: "Message",
        default: true,
        js: ["content_scripts/prettify.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&prettify=disable*",
            "/*prettify=disable*"
        ],
        options: [
            { id: "autoPrettify", type: "checkbox", label: "Prettify XML/FHIR by Default", desc: "Prettifies XML and JSON payloads on page load. If disabled, payloads load raw but can be toggled to prettified.", default: false }
        ]
    }
};
