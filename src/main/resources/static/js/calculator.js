/**
 * 거래내역에서 해당자산의 데이터 취합
 * datas['sumData'].filter(x => x.assetNm.includes(assetNm)) 으로 확인
 * @param {string} assetNm : 자산이름
 */
function complexData(assetNm){
    let tg = datas['trInfo']['voList'].filter(x => x.assetNm === assetNm);
    let tgBuy , tgSell;
    tgBuy = tg.filter(x => x.trMethod === '매수');
    tgSell = tg.filter(x => x.trMethod === '매도');


    let startDay = new Date('2021-08-01');
    let lastDay = new Date();
    let monthDiff = inMonths(startDay, lastDay);

    template = {assetNm : assetNm, data : {}};
    let stY = 2021, stM = 7;
    for(let i = 0; i < monthDiff + 1; i ++){
        let date = new Date(stY, stM + i);
        let dM = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
        let idx = `${date.getFullYear()}-${dM}`;

        //데이터 취합
        let tempBuyData = tgBuy.filter(x => x.trDate.includes(idx));
        let tempSellData = tgSell.filter(x => x.trDate.includes(idx));

        let bAmt = 0, sAmt = 0, bCost = 0, sCost = 0, totBP = 0, totSP = 0, bPrice = 0, sPrice = 0, trResult = 0;

        for(let k = 0; k < tempBuyData.length; k++){
            bAmt += tempBuyData[k]['trAmt'];
            bCost += tempBuyData[k]['trCost'];
            totBP += tempBuyData[k]['trTotprice'];
        }
        bPrice = Math.floor((totBP + bCost) / bAmt);
        for(let k = 0; k < tempSellData.length; k++){
            sAmt += tempSellData[k]['trAmt'];
            sCost += tempSellData[k]['trCost'];
            totSP += tempSellData[k]['trTotprice'];
            trResult += tempSellData[k]['trResult'];
        }
        sPrice = Math.floor((totSP - sCost) / sAmt) ;

        //NaN 처리
        sPrice = Number.isNaN(sPrice) ? 0 : sPrice;
        bPrice = Number.isNaN(bPrice) ? 0 : bPrice;

        template['data'][idx] = {
            bAmt : bAmt, bCost : bCost, totBP : totBP, bPrice : bPrice,
            sAmt : sAmt, sCost : sCost, totSP : totSP, sPrice : sPrice,
            trResult : trResult}
        
        let outputObj = getAdjustedEarn(idx); //당월 매도분 차익 계산
        let output = outputObj['realEarn'];
        let adjPrice = outputObj['adjPrice'];
        let thisCase = outputObj['thisCase'];
        let accAmt = outputObj['accAmt'];
        let accTot = outputObj['accTot'];
        let accPrice = outputObj['accPrice'];
        
        template['data'][idx]['output'] = output;
        template['data'][idx]['adjPrice'] = adjPrice;
        template['data'][idx]['thisCase'] = thisCase;
        template['data'][idx]['accAmt'] = accAmt;
        template['data'][idx]['accTot'] = accTot;
        template['data'][idx]['accPrice'] = accPrice;
        template['data'][idx]['needRecoverAmt'] = outputObj['needRecoverAmt'];
        template['data'][idx]['recoveredAmt'] = outputObj['recoveredAmt'];
        template['data'][idx]['needRecoverTot'] = outputObj['needRecoverTot'];
        template['data'][idx]['recoveredTot'] = outputObj['recoveredTot'];
        template['data'][idx]['recoverResult'] = outputObj['recoverResult'];
        template['data'][idx]['needRecoverPrice'] = outputObj['needRecoverPrice'];
        template['data'][idx]['recoveredPrice'] = outputObj['recoveredPrice'];
        template['data'][idx]['lastNeedRecoverPrice'] = outputObj['lastNeedRecoverPrice'];
        template['data'][idx]['recoveringEarn'] = outputObj['recoveringEarn'];
        template['data'][idx]['reCalRcvrRslt'] = outputObj['reCalRcvrRslt'];

    }
    //총 매수매도 개수, 매수매도 총액
    let rBAmt = 0, rTotBP = 0, rBCost = 0, rBPrice = 0, rSAmt = 0, rTotSP = 0, rSCost = 0, rSPrice = 0, totOutput = 0, totOutput2 = 0, trResult = 0;
    Object.keys(template['data']).forEach(e => {
        rBAmt += template['data'][e]['bAmt'];
        rTotBP += template['data'][e]['totBP'];
        rBCost += template['data'][e]['bCost'];
        rSAmt += template['data'][e]['sAmt'];
        rTotSP += template['data'][e]['totSP'];
        rSCost += template['data'][e]['sCost'];
        totOutput += template['data'][e]['output'];
        //totOutput2 += template['data'][e]['output'] + template['data'][e]['trResult'];
        trResult += template['data'][e]['trResult'];
    })
    
    rBPrice = Math.floor((rTotBP + rBCost) / rBAmt);
    rSPrice = Math.floor((rTotSP - rSCost) / rSAmt);
    //NaN 처리
    rBPrice = Number.isNaN(rBPrice) ? 0 : rBPrice;
    rSPrice = Number.isNaN(rSPrice) ? 0 : rSPrice;
    let nowTot = 0;
    //보유중인 경우 현재 기록 평단 불러오기
    if(rBAmt - rSAmt > 0){
        nowTot = datas['myAssetInfo']['shareList'].filter(x => x.assetNm.includes(assetNm)).map(m => m.assetNowTotal)[0];
    }

    if(totOutput === 0) totOutput = trResult;

    template['result'] = {
        remainA : rBAmt - rSAmt,
        remainP : (rTotBP - rTotSP) + (rSCost + rBCost),
        nowTot : nowTot,
        totDiff : nowTot - ( (rTotBP - rTotSP) - (rSCost + rBCost) ),
        realTot :  ( nowTot - ( (rTotBP - rTotSP) - (rSCost + rBCost) ) ) + totOutput,
        totOutput : totOutput, //총 매도차익 (보유중 매도분)
        totOutput2 : totOutput2,
        rBAmt : rBAmt,
        rTotBP : rTotBP,
        rBCost : rBCost,
        rSAmt : rSAmt,
        rTotSP : rTotSP,
        rSCost : rSCost,
        rBPrice : rBPrice,
        rSPrice : rSPrice,
        trResult : trResult,
    }

    cmnEx.getDividendInfo();
    let thisDividend = datas['summaryDividend'].filter(x => x.assetNm.includes(assetNm))?.map(m => m.totP)?.[0] ?? 0;
    template['result']['thisDividend'] = thisDividend;
    datas['sumData'].push(template);

    //전월매수단가 반영한 단가계산처리 필요
}

/**
 * @returns object keys: realEarn, adjPrice, thisCase
 * 금월까지의 누적 수량변동 (매도후 재매집 등 계산목적)을 위한 별도의 칼럼하나 필요한 것 같음
 */
function getAdjustedEarn(idx){
    let totBP = 0, totSP = 0, bAmt = 0, sAmt = 0, bCost = 0, sCost = 0;
    let dataObj = template['data'];
    let lastIdx = Object.keys(dataObj)[Object.keys(dataObj).length - 1];
    let lLastIdx = Object.keys(dataObj)[Object.keys(dataObj).length - 2];

    
    let accAmt = 0, accPrice = 0, accTot = 0;
    //누적단가, 금액 및 금월데이터 정리
    let thisMData = new Object(), lastMData = new Object();
    let thisMAmt = 0, thisMPrice = 0, thisMTot = 0, recoverEarn = new Array(),
        needRecoverAmt = 0, recoveredAmt = 0, needRecoverTot = 0, recoveredTot = 0, recoverResult = 0, needRecoverPrice = 0, recoveredPrice = 0,
        lastNeedRecoverPrice = 0, recoveringEarn = 0, reCalRcvrRslt = false;
    let thisMObj = dataObj[lastIdx], lastMObj = dataObj[lLastIdx];

    thisMAmt = thisMObj['bAmt'] - thisMObj['sAmt'];
    thisMTot = thisMObj['totBP'] - thisMObj['totSP'] + (thisMObj['bCost'] + thisMObj['sCost']);
    
    Object.keys(dataObj).forEach(e => {
        accAmt = 0;
        if(lLastIdx){
            lastMData = dataObj[lLastIdx];
        }
        thisMData['bAmt'] = dataObj[e]['bAmt'];
        thisMData['totBP'] = dataObj[e]['totBP'];
        thisMData['bCost'] = dataObj[e]['bCost'];
        thisMData['sAmt'] = dataObj[e]['sAmt'];
        thisMData['totSP'] = dataObj[e]['totSP'];
        thisMData['sCost'] = dataObj[e]['sCost'];
        thisMData['trResult'] = dataObj[e]['trResult'];

        thisMAmt = thisMData['bAmt'] - thisMData['sAmt'];
        thisMTot = thisMData['totBP'] - thisMData['totSP'] - (thisMData['bCost'] + thisMData['sCost']);
        thisMPrice = Math.round(thisMTot / thisMAmt);

        bAmt += dataObj[e]['bAmt']; sAmt += dataObj[e]['sAmt'];
        bCost += dataObj[e]['bCost']; sCost += dataObj[e]['sCost'];
        totBP += dataObj[e]['totBP']; totSP += dataObj[e]['totSP'];
        lastNeedRecoverPrice = dataObj[e]['lastNeedRecoverPrice'] ?? 0;
        accAmt += bAmt - sAmt;

        recoveringEarn = 0;
        recoverResult = 0;
        
        if(accAmt > 0){
            //보유분 감소
            if(thisMAmt < 0){
                //recover 물량 발생
                needRecoverAmt += thisMAmt;
                needRecoverTot += thisMTot;
                needRecoverPrice = Math.round(needRecoverTot / needRecoverAmt);
                lastNeedRecoverPrice = needRecoverPrice;
                recoveredAmt = 0, recoveredPrice = 0, recoveredTot = 0;
    
            } else if(needRecoverAmt < 0 && thisMAmt > 0){
                let recoverObj = new Object();
                //recovering
                needRecoverAmt += thisMAmt;
                needRecoverTot += thisMTot;
                recoveredAmt = thisMAmt; //재매집한 수량
                recoveredTot = thisMTot;
                recoveredPrice = Math.round(recoveredTot / recoveredAmt);
                recoveringEarn = (needRecoverPrice - recoveredPrice) * recoveredAmt;
                recoverObj['pk'] = e;
                recoverObj['state'] = 'recovering';
                if(needRecoverAmt >= 0){
                    //recover close :: recover 종료시 수익계산 다시해야함**** 230409
                    let lMNeedRecoverTot = lastMObj['needRecoverTot'];
                    recoveredAmt = recoveredAmt - needRecoverAmt;
                    recoveredTot = thisMPrice * recoveredAmt;
                    recoverResult = -(lMNeedRecoverTot + recoveredTot);
                    needRecoverAmt = 0;
                    needRecoverTot = 0;
                    needRecoverPrice = 0;
                    recoveringEarn = 0;
                    recoverObj['state'] = 'recover close';
                }
                recoverObj['recoveredAmt'] = recoveredAmt;
                recoverObj['recoveredTot'] = recoveredTot;
                recoverObj['recoveredPrice'] = recoveredPrice;
                recoverObj['needRecoverAmt'] = needRecoverAmt;
                recoverObj['needRecoverTot'] = needRecoverTot;
                recoverObj['recoveringEarn'] = recoveringEarn;
                recoverObj['recoverResult'] = recoverResult;
                let chkHas = recoverEarn.filter(x => x.pk === e);
                if(chkHas.length === 0 && Object.keys(recoverObj).length > 0){
                    recoverEarn.push(recoverObj);
                }
            } else if(needRecoverAmt === 0) {
                recoveredAmt = 0;
                recoveredPrice = 0;
                recoveredTot = 0;
                recoverResult = 0;
            }
        } else {
            //청산
            let recoverObj = new Object();
            recoverObj['state'] = 'recover close';
            recoverObj['recoveredAmt'] = recoveredAmt;
            recoverObj['recoveredTot'] = recoveredTot;
            recoverObj['recoveredPrice'] = recoveredPrice;
            recoverObj['needRecoverAmt'] = needRecoverAmt;
            recoverObj['needRecoverTot'] = needRecoverTot;
            recoverObj['recoveringEarn'] = recoveringEarn;
            recoverObj['recoverResult'] = recoverResult;
            recoverEarn.push(recoverObj);

            recoveredAmt = 0;
            recoveredPrice = 0;
            recoveredTot = 0;
            recoverResult = 0;
            
            lastNeedRecoverPrice = 0;
            needRecoverAmt = 0;
            needRecoverPrice = 0;
            needRecoverTot = 0;
            /*실현손익이 totBP와 totSP에 녹아있다는 사유로 손익이 과대계상되는 현상이 있음 230618 계산방식 변경이 필요함*/
            totBP = 0;
            totSP = 0;
            bCost = 0;
            sCost = 0;
        }
    })
    //recover close 계산용
    let pks = recoverEarn.map(m => m.pk);
    if(recoverEarn.length > 0 && pks.includes(lastIdx)){
        let closeIdxs = [];
        let ingIdxs = [];
        //recovering, recover close 분류
        recoverEarn.forEach((e, idx) => {
            if(e.state.includes('close')){
                closeIdxs.push(idx);
            } else {
                ingIdxs.push(idx);
            }
        })
        
        if(closeIdxs.length > 0){
            let bfCloseIdx = 0;
            closeIdxs = closeIdxs.filter(x => x > 0);
            closeIdxs.forEach(e => {
                let totRcvringEarn = 0;
                let thisRecoveringIdxs = ingIdxs.filter(x => x < e && x >= bfCloseIdx);
        
                if(thisRecoveringIdxs.length > 0){
                    thisRecoveringIdxs.forEach(t => {
                        totRcvringEarn += recoverEarn[t].recoveringEarn;
                    })
                }
                recoverResult = recoverEarn[e].recoverResult - totRcvringEarn;//recoverEarn[e].recoverResult; //불필요하게 리커버링수익을 빼는 부분 주석처리
                bfCloseIdx = e;
            })
        }
    }
    /*230618 현재 여기서 계산한 accTot, accPrice가 현재 보유현황의 accTot, accPrice와 차이가 발생하고 있음 원인파악 필요*/
    if(accAmt > 0){
        accTot = totBP - totSP - (bCost + sCost);
        accPrice = Math.round(accTot / accAmt);
    } else {
        //청산
        accTot = 0, accPrice = 0;
    }
    
    let cases = {
        case1 : {1 : `recovering`, 2 : `recover close`},
        case2 : {1 : `case2-1 : 매집단가보다 비싸져 수익실현하는 구간`, 2 : `case2-2 : 하락세 도중 선매도. 일부 손실실현`, 3 : `case2-3 : 청산`},
        case3 : `case3 : 수량변동은 없으나 매매행위만 일어난 경우의 차익계산`,
        case4 : `case4 : 매집중`,
        case5 : `case5 : 거래 없음`,
    }

    let realEarn = 0, adjPrice = 0;
    let standard = thisMData['bAmt'] - thisMData['sAmt']; //금월수량변동

    //조정단가 산출 : 순매수, 순매도시의 조정단가가 이상하게 높게 산정되는 현상이 있음. 수정필요 20230603. 
    //현재 적용된 공식은 매수매도가 섞인 달에는 유효하나, 순매매에는 과도하게 높거나 낮게 측정되고 있음.
    //지난달의 거래 결과인 단가가 이번달에 적용되고 있는 것에서 기인한 문제가 아닌가?

    let thisCase;
    
    let lastMAmt = lastMData['bAmt'] - lastMData['sAmt'];
    let lastMTot = (lastMData['totBP'] - lastMData['totSP'] - (lastMData['bCost'] + lastMData['sCost']));
    let lastMPrice = Math.round(lastMTot / lastMAmt);
    
    thisMAmt = Math.abs(standard);
    thisMPrice = Math.abs(Math.round(thisMTot / thisMAmt));
    adjPrice = thisMPrice
    
    //case1 : recover
    let thisMRecovered = false;
    if(recoverEarn.length > 0){
        thisMRecovered = recoverEarn[recoverEarn.length - 1]['pk'] === lastIdx ? true : false;
    }
    let hasTred = standard === 0 ? (thisMData['bAmt'] > 0 ? true : (thisMData['sAmt'] > 0 ? true : false)) : true;
    if(thisMRecovered){
        let recoverData = recoverEarn.filter(x => x.pk === lastIdx);
        thisCase = cases['case1'][1];
        realEarn = recoveringEarn;
        if(recoverData[0]['state'].includes('close')){
            thisCase = cases['case1'][2];
            realEarn = recoverResult;
        } else recoverResult = 0;
    }
    //case2 : 매도량 > 매수량. 전월보유분 매도차익 계산
    else if(standard < 0) {
        if(!isNaN(thisMPrice)){
            //청산
            if(accAmt === 0){
                thisCase = cases['case2'][3];
                realEarn = thisMData['trResult'];
            }
            // 지난달 매집단가보다 비싸져 수익실현하는 구간
            else if(thisMPrice > accPrice){
                thisCase = cases['case2'][1];
                //realEarn = Math.abs((adjPrice - bfPrice) * lastMAmt); //실제실현 = (실제단가 - 전월보유단가) * 거래수량
                realEarn = (thisMPrice - accPrice) * thisMAmt;
            } 
            // 지난달단가 < 이번달단가. 하락세 도중 선매도. 일부 손실실현
            else if(thisMPrice < accPrice){
                thisCase = cases['case2'][2];
                //realEarn = Math.abs(adjPrice - bfPrice) * lastMAmt; //실제실현 = (실제단가 - 전월보유단가) * 거래수량
                //realEarn = Math.abs(adjPrice - thisMPrice) * thisMAmt;
                realEarn = thisMData['trResult'];
            }
        }
        
    } 
    //case3 : 수량변동은 없으나 매매행위만 일어난 경우의 차익계산
    else if(standard === 0 && hasTred === true){
        thisCase = cases['case3'];
        realEarn = Math.abs(thisMData['totBP'] - (thisMData['totSP'] + thisMData['bCost'] + thisMData['sCost'])); //금월 총 투입금 변동 (줄었을 경우 그만큼 차익)
    }
    //case4 : 매수량 > 매도량.
    else if(standard > 0){
        thisCase = cases['case4'];
    }
    
    
        
    if((template.assetNm.includes('셀트') || template.assetNm.includes('GS') || template.assetNm.includes('이니')) && lastIdx.startsWith('2023-0')){
    }

    thisCase = thisCase ?? cases['case5'];
    return {realEarn : realEarn, adjPrice : adjPrice, thisCase : thisCase, accAmt : accAmt, accPrice : accPrice, accTot : accTot
        , needRecoverAmt : needRecoverAmt, recoveredAmt : recoveredAmt, needRecoverTot : needRecoverTot, recoveredTot : recoveredTot
        , recoverResult : recoverResult, needRecoverPrice : needRecoverPrice, recoveredPrice : recoveredPrice, lastNeedRecoverPrice : lastNeedRecoverPrice
        , recoveringEarn : recoveringEarn , reCalRcvrRslt : reCalRcvrRslt};
}