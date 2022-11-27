import { Bookmark, TagState } from "../../../src/types";
import { beforeEach, describe, expect, it } from "vitest";
import { Link } from "../../../src/model/link";
import { Links } from "../../../src/model/link-collection";

describe("unfiltered link-container", function () {
  let testCollection: Links;

  beforeEach(function () {
    testCollection = new Links([
      new Link(
        "http://example.com/1",
        ["tag1", "unwanted-tag"],
        "example-title-1",
        "example-image-1",
        "example-description-1"
      ),
      new Link(
        "http://example.com/3",
        ["tag3", "grouped-tag"],
        "example-title-3",
        "example-image-3",
        "example-description-3"
      ),
      new Link(
        "http://example.com/2",
        ["tag2", "grouped-tag"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      ),
    ]);
  });

  it("a valid no-arg initialiser", () => {
    let container = new Links();
    expect(container.links).to.eql([]);
    expect(container.searchString).to.equal("");
    expect(container.states).to.eql({});
  });

  it("is indexable", () => {
    let result = testCollection.getFromFiltered(0);
    expect(result).to.eql(
      new Link(
        "http://example.com/1",
        ["tag1", "unwanted-tag"],
        "example-title-1",
        "example-image-1",
        "example-description-1"
      )
    );
  });

  it("is has a length", () => {
    let result = testCollection.filteredLength;
    expect(result).to.equal(3);
  });

  it("return a filtered and sorted collection on iteration", () => {
    testCollection.advanceState("grouped-tag");
    let result = new Array(...testCollection);
    expect(result).to.eql([
      new Link(
        "http://example.com/2",
        ["grouped-tag", "tag2"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      ),
      new Link(
        "http://example.com/3",
        ["grouped-tag", "tag3"],
        "example-title-3",
        "example-image-3",
        "example-description-3"
      ),
    ]);
  });

  it("can be converted to/from JSON", () => {
    let result = Links.fromJson(testCollection.toJson());
    expect(result).to.eql(testCollection);
  });
});

describe("filtered link-container", function () {
  let testCollection: Links;

  beforeEach(function () {
    testCollection = new Links([
      new Link(
        "http://example.com/1",
        ["tag1", "unwanted-tag"],
        "example-title-1",
        "example-image-1",
        "example-description-1"
      ),
      new Link(
        "http://example.com/3",
        ["tag3", "grouped-tag"],
        "example-title-3",
        "example-image-3",
        "example-description-3"
      ),
      new Link(
        "http://example.com/2",
        ["tag2", "grouped-tag"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      ),
    ]);
    testCollection.advanceState("grouped-tag");
  });

  it("is iterable", () => {
    let result = new Array(...testCollection);
    expect(result).to.eql([
      new Link(
        "http://example.com/2",
        ["grouped-tag", "tag2"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      ),
      new Link(
        "http://example.com/3",
        ["grouped-tag", "tag3"],
        "example-title-3",
        "example-image-3",
        "example-description-3"
      ),
    ]);
  });

  it("is indexable", () => {
    let result = testCollection.getFromFiltered(0);
    expect(result).to.eql(
      new Link(
        "http://example.com/2",
        ["grouped-tag", "tag2"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      )
    );
  });

  it("is has a length of all links", () => {
    let result = testCollection.totalLength;
    expect(result).to.equal(3);
  });

  it("shows the filtered length when filtering on tags", () => {
    let result = testCollection.filteredLength;
    expect(result).to.equal(2);
  });

  it("shows the filtered length including text-search", () => {
    testCollection.search("description-2");
    let result = testCollection.filteredLength;
    expect(result).to.equal(1);
  });

  it("provides a method to reset the search", () => {
    testCollection.search("description-2");
    testCollection.reset();
    let result = testCollection.filteredLength;
    expect(result).to.equal(testCollection.totalLength);
  });

  it("provides a method to retrieve the current tag state", () => {
    let result = testCollection.getState("grouped-tag");
    expect(result).to.equal(TagState.INCLUDED);
    result = testCollection.getState("unwanted-tag");
    expect(result).to.equal(TagState.NEUTRAL);
  });

  it("provides a method to advance the state of a tag", () => {
    let result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
    testCollection.advanceState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.INCLUDED);
    testCollection.advanceState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.EXCLUDED);
    testCollection.advanceState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
  });

  it("provides a method to reverse the state of a tag", () => {
    let result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
    testCollection.reverseState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.EXCLUDED);
    testCollection.reverseState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.INCLUDED);
    testCollection.reverseState("tag1");
    result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
  });

  it("has sensible defaults for 'corrupted' state values when advancing", () => {
    testCollection.states["tag1"] = 42;
    testCollection.advanceState("tag1");
    let result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
  });

  it("has sensible defaults for 'corrupted' state values when reversing", () => {
    testCollection.states["tag1"] = 42;
    testCollection.reverseState("tag1");
    let result = testCollection.getState("tag1");
    expect(result).to.equal(TagState.NEUTRAL);
  });
});

describe("my tests", function () {
  let testCollection: Links;
  let target: Bookmark;

  beforeEach(function () {
    testCollection = new Links([
      new Link(
        "http://example.com/1",
        ["tag1", "unwanted-tag"],
        "example-title-1",
        "example-image-1",
        "example-description-1"
      ),
      new Link(
        "http://example.com/3",
        ["tag3", "grouped-tag"],
        "example-title-3",
        "example-image-3",
        "example-description-3"
      ),
      new Link(
        "http://example.com/2",
        ["tag2", "grouped-tag"],
        "example-title-2",
        "example-image-2",
        "example-description-2"
      ),
    ]);
    target = {
      href: "http://example.com/1",
      tags: ["tag1", "unwanted-tag"],
      title: "example-title-1",
      image: "example-image-1",
      description: "example-description-1",
    };
  });

  it("has an empty compString", () => {
    const testLink = new Link("", ["tag1"]);
    expect(testLink.compString).to.eql("");
  });

  it("has compString by title", () => {
    const testLink = new Link("", ["tag1"], "example-title");
    expect(testLink.compString).to.eql("example-title");
  });

  it("has compString by href", () => {
    const testLink = new Link("http://example.com/", ["tag1"]);
    expect(testLink.compString).to.eql("http://example.com/");
  });

  it("should return 0 when collection is empty", () => {
    const testCollection = new Links();
    expect(testCollection.isEmpty).to.true;
  });

  it("should return Link from index", () => {
    expect(testCollection.getFromAll(2)).to.eql(testCollection.links[2]);
  });
});
