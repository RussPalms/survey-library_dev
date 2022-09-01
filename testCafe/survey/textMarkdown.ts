import { frameworks, url, initSurvey, getSurveyResult, getListItemByText } from "../helper";
import { Selector, ClientFunction } from "testcafe";
const title = "Test survey width";

const json = {
  elements: [
    {
      type: "checkbox",
      name: "question1",
      choices: [
        { value: 1, text: "|item 1|" },
        { value: 2, text: "|item 2|" },
        { value: 3, text: "|item 3|" }
      ]
    },
    {
      type: "dropdown",
      placeHolder: "Click me",
      name: "question2",
      choices: [
        { value: 1, text: "|choice 1|" },
        { value: 2, text: "|choice 2|" },
        { value: 3, text: "|choice 3|" }
      ]
    }
  ]
};

const setMarkdownEvent = ClientFunction(() => {
  window["survey"].onTextMarkdown.add((sender, options) => {
    if (options.text.indexOf("|") > -1) {
      options.html = "<span class='markdownclass'>" + options.text.replace("|", "*").replace("|", "*") + "</span>";
    }
  });
});

frameworks.forEach((framework) => {
  fixture`${framework} ${title}`.page`${url}${framework}.html`.beforeEach(
    async (t) => {
      await initSurvey(framework, json);
      await setMarkdownEvent();
    }
  );

  test("Check Text Markdown on checkbox", async (t) => {
    await t
      .click(Selector(".markdownclass").withText("*item 2*"))
      .click("input[value=Complete]");

    const surveyResult = await getSurveyResult();
    await t.expect(surveyResult.question1).eql([2]);
  });
  test.only("Check Text Markdown on dropdown", async (t) => {
    await t
      .click(Selector(".sv_q_dropdown_control"))
      .click(Selector(".markdownclass").withText("*choice 3*"))
      .click(Selector(".sv_q_dropdown_control").withText("|choice 3|"))
      .click(Selector(".markdownclass").withText("*choice 2*"))
      .click("input[value=Complete]");

    const surveyResult = await getSurveyResult();
    await t.expect(surveyResult.question2).eql(2);
  });
});