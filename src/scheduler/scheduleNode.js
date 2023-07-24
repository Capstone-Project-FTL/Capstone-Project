/**
 * @class
 * @classdesc This class represents the nodes for each schedule.
    A node represents a single unit of instruction (sections or labs included).
    This class allows to unify the operations performed on both sections and labs
 */
class ScheduleNode{
    /**
     * 
     * @param {string[]} days - the days for the node
     * @param {Date} startTime - the start time in 24 hour format
     * @param {Date} endTime - the end time in 24 hour format
     * @param {string} coursePrefix - course prefix
     * @param {string} courseId - course id
     * @param {number} nodeIndex - the index of the node in the actual course
     * @param {boolean} [isLab=false] - indicates if it is a lab, if not then it is a section
     */
    constructor(days, startTime, endTime, coursePrefix, courseId, nodeIndex, isLab = false){
        this.days = new Set(days)
        this.startTime = startTime
        this.endTime = endTime
        this.coursePrefix = coursePrefix
        this.courseId = courseId
        this.nodeIndex = nodeIndex
        this.isLab = isLab
        this.startTimeStr = `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`
        this.endTimeStr = `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`
    }

    toString(){
        return `${this.isLab ? "Lab" : "Section"}: ${this.coursePrefix} ${this.courseId} ${Array.from(this.days).toString()} (${this.startTimeStr} - ${this.endTimeStr})`
    }
}

module.exports = ScheduleNode