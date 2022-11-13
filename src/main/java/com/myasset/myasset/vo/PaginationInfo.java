package com.myasset.myasset.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * @return
 */
@Getter
@Setter
public class PaginationInfo {
    /*
     * 사용자 직접입력
     */
    public int currentPageNo;
    public int pageSize;
    public int totalRecordCount;
    public int recordCountPerPage;
    public int firstIndex;
    /*
     * 입력값으로 계산
     */
    public int totalPageCount;

    public int getTotalPageCount() {
        return ((this.totalRecordCount - 1) / this.recordCountPerPage) + 1;
    }

    public int getFirstIndex() {
        return this.firstIndex;
    }

    public void setFirstIndex() {
        this.firstIndex = (this.currentPageNo - 1) * this.recordCountPerPage;
    }

}
