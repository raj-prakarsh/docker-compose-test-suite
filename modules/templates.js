"use strict";

const os = require("os");
const about = require("./../config/version");
const started = new Date();
const { statusCodes } = require("./httpResponse");

/**
 * If env APPINSIGHTS_INSTRUMENTATIONKEY is set, return ApplicationInsights script.
 */
const applicationInsights = () => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY == null) {
    return "";
  }

  return `
      <script>
        var appInsights=window.appInsights||function(a){
            function b(a){c[a]=function(){var b=arguments;c.queue.push(function(){c[a].apply(c,b)})}}var c={config:a},d=document,e=window;setTimeout(function(){var b=d.createElement("script");b.src=a.url||"https://az416426.vo.msecnd.net/scripts/a/ai.0.js",d.getElementsByTagName("script")[0].parentNode.appendChild(b)});try{c.cookie=d.cookie}catch(a){}c.queue=[];for(var f=["Event","Exception","Metric","PageView","Trace","Dependency"];f.length;)b("track"+f.pop());if(b("setAuthenticatedUserContext"),b("clearAuthenticatedUserContext"),b("startTrackEvent"),b("stopTrackEvent"),b("startTrackPage"),b("stopTrackPage"),b("flush"),!a.disableExceptionTracking){f="onerror",b("_"+f);var g=e[f];e[f]=function(a,b,d,e,h){var i=g&&g(a,b,d,e,h);return!0!==i&&c["_"+f](a,b,d,e,h),i}}return c
        }({
            instrumentationKey: "${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}"
        });      
        window.appInsights=appInsights,appInsights.queue&&0===appInsights.queue.length&&appInsights.trackPageView();
      </script>
      `;
};

/**
 * Header html
 */
let header = function header(title) {
  return `<!DOCTYPE html>
    <!-- Served by Tamarack -->
    <html lang="en">
    <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,shrink-to-fit=no">
        ${applicationInsights()}
        <style>
            body {
                background-color: #e3e5e3;
                margin: 0;
                font-family: Arial,Helvetica Neue,helvetica,sans-serif;
                font-weight: 400;
                line-height: 1.4375;
                font-size: 1.2rem;
            }
            .wrapper {
                padding: 40px;
                font-family: arial, helvetica;
                box-shadow: 0 0 5px 5px #aeb4ae;
                background-color: #fff;
                transform: rotate(-5deg);
                -moz-transform: rotate(-5deg);
                -webkit-transform: rotate(-5deg);
                padding: 30px 40px 40px;
                max-width: 750px;
                margin: 30px auto;
            }
            h1 {
                font-size: 2.75rem;
                font-weight: 400;
                line-height: auto;
            }
            h2 {
                font-size: 2.0rem;
                font-weight: 400;
                margin: 0 0 0.5rem 0
            }
            h3 {
                font-size: 1.4rem;
                font-weight: bold;
                margin: 0 0 0.5rem 0
            }
            p {
                font-size: 1.125rem;
            } 

            p.small {
                font-size: 0.9rem;
                color: #666;
            }
            a {
                color: #006cb7;
                text-decoration: none;
            }
            .importance {
                display: none;
            }
            .alert {
                opacity: 0;
            }

            .alert-info {
                color: #000;
                font-size: 1.2rem;
                min-height: 4.4rem;
                border-radius: .15rem;
                border: 1px solid #faebcc;
                position: relative;
                padding: 1rem;
                background-color: #fcf8e3;
                opacity: 1;
                transition: opacity 0.5s ease-in;
            }

            .team-alerted {
                padding-top: 1rem;
                font-size: 1.2rem;
            }

            .importance-marker {
                width: 1rem;
                height: 1rem;
                display: inline-block;
                font-weight: normal;
                border-radius: 10px;
                box-shadow: 1px 1px 1px #cccccc;
                background: #ddd;
                margin-right: 0.5rem;
            }

            .importance-marker.low {
                background: #dddddd;
            }
            
            .importance-marker.medium {
                background: #24a0d8;
            }
            
            .importance-marker.high {
                background: #d85497;
            }
              
            }


        </style>
    </head>
    <body>

    <div class="wrapper">
        <a href="https://www.kth.se/"><img width=76 height=76 src="https://www.kth.se/polopoly_fs/1.77257!/KTH_Logotyp_RGB_2013-2.svg" alt="KTH Logotype"></a>
`;
};

/**
 * Footer html
 */
let footer = function footer(statusCode) {
  let statusCodeParagraph = `<p class="small">For all you techies, yes that means response code ${statusCode} </p>`;
  if (statusCode == statusCodes.OK) {
    statusCodeParagraph = "";
  }
  return `
        <p class="small">Page served by: Tamarack</p>${statusCodeParagraph}</div>
        </body>
    </html>
`;
};

/**
 * 404 error page
 */
let error404 = function error404() {
  return `
    ${header(`Page not found`)}
        <h1>Sorry, we have nothing to show for the web address you entered.</h1>
        <h2>The service may have been moved or deleted.</h2>
        <p>Please also check the web address for proper spelling and capitalization, or try
        <a href="https://www.kth.se/search/">searching for it</a>.</p>
    ${footer(statusCodes.NOT_FOUND)}
    `;
};

/**
 * 502 error page Bad Gateway
 */
let error5xx = function error5xx(request) {
  return `
    ${header(`Sorry, the service is not working as intended`)}
            
            <script>
                let url = "/_application?pathname=" + encodeURI(document.location.pathname);
                console.log(url)
                fetch(url).then(
                    function (response) {
                        if (response.status !== 200) {
                            console.log('Could not get application information. Status Code: ' + response.status);
                            return;
                        }

                        response.json().then(function (data) {
                            let importance = data.importance;
                            if (importance != null) {
                                document.getElementById('importance').classList.add("alert-info");

                                let elements = document.getElementsByClassName('publicName');
                                [].slice.call(elements).forEach(function (element) {
                                    element.innerHTML = data.publicNameEnglish;
                                });
                                document.getElementById('importance-' + importance).style.display = "block";
                            }
                        });
                    }
                )
                .catch(function (err) {
                    console.log('Error when getting application information.', err);
                });
            </script>

            <h1><span class="publicName">The service</span> does not work at the moment!</h1>
            
            <div aria-live="polite" role="alert" id="importance" class="alert">

                <div id="importance-high" class="importance">
                <h3>Expect <span class="publicName">the service</span> to be back soon</h3>
                    <span class="importance-marker high"></span> <span class="publicName">This application</span> is classified as beeing of <strong>high importance</strong>.
                    This means that it is actively monitored by operations personal during office hours.
                    Operations are on call until midnight. Action to bring back the service is
                    normally taken within 15 minutes during office hours, and within one hour during On call hours.
                    <br /><br />
                    We are sorry for the inconvenience this might cause you!

                </div>

                <div id="importance-medium" class="importance">
                    <h3>Expect <span class="publicName">the service</span> to be back within 2 hours</h3>
                    <span class="importance-marker medium"></span> <span class="publicName">This service</span> is actively monitored by operations
                    personal during office hours. Action to bring back the service is normally taken within 2 hours. Outages outside
                    office hours are handled the following morning.
                    <br /><br />
                    We are sorry for the inconvenience this might cause you!
                </div>

                <div id="importance-low" class="importance">
                    <h3><span class="publicName">The service</span> should be back within a day</h3>
                    <span class="importance-marker low"></span> Unfortunatelly this service is classified as having a low impact, compared to other services. 
                    There for you can only expect <span class="publicName">the service</span> to work normally within a day.
                    <br><br>
                    Hopefully it will be back sooner :)
                </div>

            </div>

            <div class="team-alerted">
                The team responsible for the service have been alerted.
                For current application status, please see our <a href="https://www.kthstatus.se/">status page</a>.
            </div>

        ${footer(statusCodes.INTERNAL_SERVER_ERROR)}
    `;
};

/**
 * Index page.
 */
let index = function index() {
  return `
    ${header("KTH Applications")}
    <h1>Applications</h1>
    <p>There is really nothing to see here, got to <a href="https://www.kth.se/">the KTH main site</a> instead. Much more interesting, hopefully ...</p>
    ${footer(statusCodes.OK)}`;
};

/**
 * robots.txt
 */
let _robotstxt = function robotstxt() {
  return `User-agent: *\nDisallow: /`;
};

/**
 * Monitor page
 */
let _monitor = function _monitor() {
    return `APPLICATION_STATUS: OK\nCLUSTER: ${
        process.env.PORTILLO_CLUSTER
            ? process.env.PORTILLO_CLUSTER
            : "No env PORTILLO_CLUSTER set."
        }\nHOSTNAME: ${
            os.hostname()
        }`;
};

/**
 * Cluster IP information (ops)
 */
let _clusters = function _clusters() {
  return {
    "everest-teal": "13.80.31.209",
    "everest-white": "104.46.44.26",
    "everest-yellow": "52.174.92.242",
    "everest-pink": "52.232.79.222",
    "everest-grey": "52.174.238.136",
    "everest-red": "52.166.33.229",
    "everest-blue": "13.81.219.131",
    "everest-black": "13.95.135.124"
  };
};

/**
 * About page
 */
let _about = function _about() {
  return `
    ${header("KTH Applications")}
            <p><strong>Docker image:</strong> ${about.dockerName}:${
    about.dockerVersion
  }</p>
            <p><strong>Hostname:</strong> ${os.hostname()}</p>
            <p><strong>Build date:</strong> ${about.jenkinsBuildDate}</p>
            <p><strong>Started:</strong> ${started}</p>
        </div>
    </body>
    </html>
    `;
};

/**
 * Module exports
 */
module.exports = {
  index: index,
  error404: error404,
  error5xx: error5xx,
  _monitor: _monitor,
  _about: _about,
  robotstxt: _robotstxt,
  _clusters: _clusters
};
