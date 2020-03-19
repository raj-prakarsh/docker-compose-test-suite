/* eslint-env mocha */
"use strict";

// Testing libraries
const expect = require("chai").expect;
const templates = require("../../modules/templates");
const name = require("../../package.json").name;
const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

describe("Template paths handling\n", function() {
  it("Path '/' should contain the public application name.", function() {
    expect(templates.index()).to.contain("KTH Applications");
  });

  it("Path 'not found', should contain a the package.json name.", function() {
    expect(templates.error404()).to.contain(capitalizedName);
  });

  it("Path 'Not working' should contain a the package.json name.", function() {
    expect(templates.error5xx()).to.contain(capitalizedName);
  });

  it("Path '/error5xx' should contain a 'Not working' message.", function() {
    expect(templates.error5xx()).to.contain(
      "Sorry, the service is not working as intended"
    );
  });

  it("Path '/error404' should contain a 'Page not found' message.", function() {
    expect(templates.error404()).to.contain("Page not found");
  });

  it("Path '/_monitor' should contain 'APPLICATION_STATUS: OK'.", function() {
    expect(templates._monitor()).to.contain("APPLICATION_STATUS: OK");
  });

  it("Path '/_monitor' should contain cluster name specified in env 'PORTILLO_CLUSTER' if set.", function() {
    const stage = "stage";
    process.env.PORTILLO_CLUSTER = stage;
    expect(templates._monitor()).to.contain(stage);
    delete process.env.PORTILLO_CLUSTER;
  });

  it("Path '/_monitor' should contain 'No env PORTILLO_CLUSTER set.' when env 'PORTILLO_CLUSTER' is not set.", function() {
    expect(templates._monitor()).to.contain("No env PORTILLO_CLUSTER set.");
  });

  it("Path '/robots.txt' should disallow all indexing.", function() {
    expect(templates.robotstxt()).to.equal("User-agent: *\nDisallow: /");
  });

  it("Path '/_clusters' should return 8 IP-numbers.", function() {
    expect(Object.keys(templates._clusters()).length).to.equal(8);
  });
});

describe("ApplicationInsights handling\n", function() {
  it("The Application Insights script is not added then the env 'APPINSIGHTS_INSTRUMENTATIONKEY' is missing.", function() {
    expect(templates.index()).to.not.contain("instrumentationKey");
  });

  it("The Application Insights script is added to the head tag when env 'APPINSIGHTS_INSTRUMENTATIONKEY' is set.", function() {
    const key = "abcd-1234-efghi";
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY = key;
    expect(templates.index()).to.contain(key);
  });

  it("All pages should contain env Application Insights key 'APPINSIGHTS_INSTRUMENTATIONKEY' if set.", function() {
    const key = "abcd-1234-efghi";
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY = key;
    expect(templates.index()).to.contain(key);
    expect(templates.error404()).to.contain(key);
    expect(templates.error5xx()).to.contain(key);
    delete process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
  });
});
