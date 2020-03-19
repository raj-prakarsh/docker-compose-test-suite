/* eslint-env mocha */
"use strict";

// Testing libraries
const expect = require("chai").expect;
const api = require("../../modules/api");

describe("API\n", function() {
  it("When env 'PORTILLO_CLUSTER' is set, return it´s value to for the query  'api.kth.se/api/pipeline/v1/search/[active|stage|integral]'.", function() {
    const stage = "stage";
    process.env.PORTILLO_CLUSTER = stage;
    expect(api._getCluster()).to.equal(stage);
    delete process.env.PORTILLO_CLUSTER;
  });

  it("When env 'PORTILLO_CLUSTER' is missing, return 'active' as default value for the api call to 'api.kth.se/api/pipeline/v1/search/active'.", function() {
    expect(api._getCluster()).to.equal("active");
    delete process.env.APPLICATIONS_API_HOST;
  });

  it("When env 'APPLICATIONS_API_HOST' is set, return its value", function() {
    const host = "api.example.com";
    process.env.APPLICATIONS_API_HOST = host;
    expect(api._applicationsApiHost()).to.equal(host);
    delete process.env.APPLICATIONS_API_HOST;
  });

  it("When env 'APPLICATIONS_API_HOST' is missing, return 'api.kth.se' as default host", function() {
    const host = "api.kth.se";
    expect(api._applicationsApiHost()).to.equal(host);
    delete process.env.APPLICATIONS_API_HOST;
  });

  it("When a url (not url encoded) is passed as an argument, it will be url encoded and appended to the path.", function() {
    const uriQuery = "/kopps/admin/page=1";
    const uriQuerEncoded = encodeURIComponent(uriQuery);
    const path = "/api/pipeline/v1/search/active";
    const expected = `${path}/${uriQuerEncoded}`;
    expect(api._getSearchPath(uriQuery)).to.equal(expected);
  });
});
