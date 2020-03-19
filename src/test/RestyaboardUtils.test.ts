import * as assert from "assert";
import * as sinon from "sinon";
import axios, { AxiosPromise } from "axios";

import { RestyaboardUtils } from "../restyaboard/RestyaboardUtils";
import { RestyaboardCard, RestyaboardList, RestyaBoard } from "../restyaboard/restyaboardComponents";

suite("RestyaboardUtils", () => {
  // Use sandbox to avoid console error from globalState.get()
  const consoleErrorSandbox = sinon.createSandbox();
  consoleErrorSandbox.stub(console, "error");
  let restyaboard: RestyaboardUtils = new RestyaboardUtils();
  consoleErrorSandbox.restore();

  suite("VS Code", () => {
    const API_KEY = "SomeApiKey";
    const API_TOKEN = "SomeApiToken";
    test("SetRestyaboardCredential correctly resolves key and token", async () => {
      const setRestyaboardCredentialStub = sinon.stub(restyaboard, "setRestyaboardCredential");
      setRestyaboardCredentialStub.onCall(0).returns(Promise.resolve(API_KEY));
      setRestyaboardCredentialStub.onCall(1).returns(Promise.resolve(API_TOKEN));
      const apiKeyPromise = restyaboard.setRestyaboardCredential(false, "Your Restyaboard API key");
      const apiTokenPromise = restyaboard.setRestyaboardCredential(true, "Your Restyaboard API token");

      const resApiKey = await apiKeyPromise.then();
      const resApiToken = await apiTokenPromise.then();

      assert.equal(resApiKey, API_KEY);
      assert.equal(resApiToken, API_TOKEN);
    });
  });

  suite("Restyaboard API", () => {
    const restyaboardApiGetRequestStub = sinon.stub(restyaboard, "restyaboardApiGetRequest");

    suite("Restyaboard API", () => {
      const BOARD_ID = "123";
      const LIST_ID = "456";
      const CARD_ID = "789";

      setup(() => {
        restyaboardApiGetRequestStub.reset();
      });

      suiteTeardown(() => {
        restyaboardApiGetRequestStub.restore();
      });

      test("getBoardById returns mock board data", async () => {
        const data = new Promise(r =>
          r({
            id: BOARD_ID,
            name: "test_board",
          })
        );
        restyaboardApiGetRequestStub.returns(data);
        const restyaBoard: RestyaBoard = await restyaboard.getBoardById(BOARD_ID);

        assert.equal(restyaBoard.id, BOARD_ID);
        assert.equal(restyaBoard.name, "test_board");
      });

      test("getListById returns mock list data", async () => {
        const data = new Promise(r =>
          r({
            id: LIST_ID,
            name: "test_list",
            idBoard: BOARD_ID,
          })
        );
        restyaboardApiGetRequestStub.returns(data);
        const restyaboardList: RestyaboardList = await restyaboard.getListById(LIST_ID);

        assert.equal(restyaboardList.id, LIST_ID);
        assert.equal(restyaboardList.name, "test_list");
        assert.equal(restyaboardList.idBoard, BOARD_ID);
      });

      test("getCardById returns mock card data", async () => {
        const data = new Promise(r =>
          r({
            id: CARD_ID,
            idShort: 1,
            name: "test_card",
            attachments: [
              {
                url: "test_attachment_url",
              },
            ],
            url: "test_url",
            desc: "test_desc",
            idChecklists: ["checklist_id_1", "checklist_id_2"],
          })
        );
        restyaboardApiGetRequestStub.returns(data);
        const restyaboardCard: RestyaboardCard = await restyaboard.getCardById(CARD_ID, BOARD_ID, LIST_ID);

        assert.equal(restyaboardCard.id, CARD_ID);
        assert.equal(restyaboardCard.idShort, '1');
        assert.equal(restyaboardCard.attachments[0].url, "test_attachment_url");
        assert.equal(restyaboardCard.name, "test_card");
        assert.equal(restyaboardCard.url, "test_url");
        assert.equal(restyaboardCard.desc, "test_desc");
        assert.equal(restyaboardCard.idChecklists[0], "checklist_id_1");
        assert.equal(restyaboardCard.idChecklists[1], "checklist_id_2");
      });

      test("getListsFromBoard returns list as array", async () => {
        const data = new Promise(r =>
          r([
            {
              id: "list_id_1",
              name: "test_list_1",
              idBoard: BOARD_ID,
            },
            {
              id: "list_id_2",
              name: "test_list_2",
              idBoard: BOARD_ID,
            },
          ])
        );
        restyaboardApiGetRequestStub.returns(data);
        const restyaboardLists: RestyaboardList[] = await restyaboard.getListsFromBoard(BOARD_ID);
        assert.equal(restyaboardLists[0].id, "list_id_1");
        assert.equal(restyaboardLists[1].id, "list_id_2");
      });

      test("getCardsFromList returns card as array", async () => {
        const data = new Promise(r =>
          r([
            {
              id: "card_id_1",
              name: "test_card_1",
              desc: "test_desc_1",
            },
            {
              id: "card_id_2",
              name: "test_card_2",
              desc: "test_desc_2",
            },
          ])
        );
        restyaboardApiGetRequestStub.returns(data);
        const restyaboardCards = await restyaboard.getCardsFromList(LIST_ID, BOARD_ID);
        assert.equal(restyaboardCards[0].id, "card_id_1");
        assert.equal(restyaboardCards[1].id, "card_id_2");
      });
    });

    suite("restyaboardApiGetRequest", () => {
      test("restyaboardApiGetRequest returns response with correct data", async () => {
        const mockResponse: AxiosPromise = new Promise(r =>
          r({
            data: {
              id: "123",
              desc: "test_description",
            },
            status: 200,
            statusText: "Ok",
            headers: "test_headers",
            config: {},
          })
        );
        sinon.stub(axios, "get").returns(mockResponse);
        const response = await restyaboard.restyaboardApiGetRequest("test_id", {});
        assert.deepEqual(response, {
          id: "123",
          desc: "test_description",
        });
      });
    });
  });
});
