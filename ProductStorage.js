﻿
function newProductStorage(pName) {

    const MODULE_NAME = "Product Storage";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    /*

    This object will initialize children objects that will end up loading the data of each set defined at each product of the bot received at initialization.
    Once all the underlaying objects are fully initialized it will callback.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user. 

    Product Storage
         |
         |-----> SingleFile
         |
         |-----> FileSequence
         |
         |-----> DailyFiles  -----> FileCursor
         |
         |-----> MarketFiles

    */

    let thisObject = {

        marketFiles: [],
        dailyFiles: [],
        singleFile: [],
        fileSequence: [],

        setDatetime: setDatetime,
        setTimePeriod: setTimePeriod,

        eventHandler: undefined,
        initialize: initialize

    }

    thisObject.eventHandler = newEventHandler();

    /* We name the event Handler to easy debugging. */

    thisObject.eventHandler.name = "Storage-" + pName;

    let datetime;
    let timePeriod;

    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] initialize -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            let dataSetsToLoad = 0;
            let dataSetsLoaded = 0;

            for (let i = 0; i < pProduct.dataSets.length; i++) {

                let thisSet = pProduct.dataSets[i];

                switch (thisSet.type) {
                    case 'Market Files': {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Market Files -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        let marketFiles = newMarketFiles();
                        marketFiles.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onMarketFileReady);
                        thisObject.marketFiles.push(marketFiles);
                        dataSetsToLoad++;
                    }
                        break;

                    case 'Daily Files': {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Daily Files -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        let dailyFiles = newDailyFiles();
                        dailyFiles.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, pDatetime, pTimePeriod, onDailyFileReady);
                        thisObject.dailyFiles.push(dailyFiles);
                        dataSetsToLoad++;
                    }
                        break;

                    case 'Single File': {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Single File -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        let singleFile = newSingleFile();
                        singleFile.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onSingleFileReady);
                        thisObject.singleFile.push(singleFile);
                        dataSetsToLoad++;
                    }
                        break;

                    case 'File Sequence': {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> File Sequence -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        let fileSequence = newFileSequence();
                        fileSequence.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onFileSequenceReady);
                        thisObject.fileSequence.push(fileSequence);
                        dataSetsToLoad++;
                    }
                        break;
                }

                function onMarketFileReady(err, pCaller) {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> Received OK Response."); }
                                break;
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> Received FAIL Response."); }
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> Received CUSTOM FAIL Response."); }
                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> err.message = " + err.message); }

                                callBackFunction(err);
                                return;
                            }

                            default: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onMarketFileReady -> Received Unexpected Response."); }
                                callBackFunction(err);
                                return;
                            }
                        }

                        let event = {
                            totalValue: pCaller.getExpectedFiles(),
                            currentValue: pCaller.getFilesLoaded()
                        }

                        thisObject.eventHandler.raiseEvent('Market File Loaded', event);

                        if (event.currentValue === event.totalValue) {

                            dataSetsLoaded++;

                            checkInitializeComplete();
                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onMarketFileReady -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function onDailyFileReady(err, pCaller) {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> Received OK Response."); }
                                break;
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> Received FAIL Response."); }
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> Received CUSTOM FAIL Response."); }
                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> err.message = " + err.message); }

                                callBackFunction(err);
                                return;
                            }

                            default: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onDailyFileReady -> Received Unexpected Response."); }
                                callBackFunction(err);
                                return;
                            }
                        }

                        let event = {
                            totalValue: pCaller.getExpectedFiles(),
                            currentValue: pCaller.getFilesLoaded()
                        }

                        thisObject.eventHandler.raiseEvent('Daily File Loaded', event);

                        if (event.currentValue === event.totalValue) {

                            dataSetsLoaded++;

                            checkInitializeComplete();
                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onDailyFileReady -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function onSingleFileReady(err, pCaller) {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Received OK Response."); }
                                break;
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Received FAIL Response."); }
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Received CUSTOM FAIL Response."); }
                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> err.message = " + err.message); }

                                callBackFunction(err);
                                return;
                            }

                            default: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Received Unexpected Response."); }
                                callBackFunction(err);
                                return;
                            }
                        }

                        let event = {
                            totalValue: 1,
                            currentValue: 1
                        }

                        thisObject.eventHandler.raiseEvent('Single File Loaded', event);

                        if (event.currentValue === event.totalValue) {

                            dataSetsLoaded++;

                            checkInitializeComplete();
                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onSingleFileReady -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function onFileSequenceReady(err, pCaller) {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received OK Response."); }
                                break;
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received FAIL Response."); }
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received CUSTOM FAIL Response."); }
                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> err.message = " + err.message); }

                                callBackFunction(err);
                                return;
                            }

                            default: {

                                if (INFO_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received Unexpected Response."); }
                                callBackFunction(err);
                                return;
                            }
                        }

                        let event = {
                            totalValue: pCaller.getExpectedFiles(),
                            currentValue: pCaller.getFilesLoaded()
                        }

                        thisObject.eventHandler.raiseEvent('File Sequence Loaded', event);

                        if (event.currentValue === event.totalValue) {

                            dataSetsLoaded++;

                            checkInitializeComplete();
                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onFileSequenceReady -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function checkInitializeComplete() {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] checkInitializeComplete -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] checkInitializeComplete -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                        if (dataSetsLoaded === dataSetsToLoad) {

                            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);

                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> checkInitializeComplete -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }

        } catch (err) {
            
            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
        }
    }

    function setDatetime(pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        /* If there is a change in the day, then we take some actions, otherwise, we dont. */

        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS);
        let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS);

        datetime = pDatetime;

        if (currentDate !== newDate) {

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                for (let i = 0; i < thisObject.dailyFiles.length; i++) {

                    thisObject.dailyFiles[i].setDatetime(pDatetime);
                }
            }
        }

    }

    function setTimePeriod(pTimePeriod) {

        if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

        /* We are going to filter out the cases in which the timePeriod received is the same that the one we already know. */

        if (timePeriod !== pTimePeriod) {

            timePeriod = pTimePeriod;

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                for (let i = 0; i < thisObject.dailyFiles.length; i++) {

                    thisObject.dailyFiles[i].setTimePeriod(pTimePeriod, datetime);
                }
            }
        }
    }
}

