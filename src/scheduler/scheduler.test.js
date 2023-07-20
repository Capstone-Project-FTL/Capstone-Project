const { daysOfWeek } = require("../scraper/utilities");
const ScheduleNode = require("./scheduleNode");
const {
  cartesianProduct,
  convertTo24Hour,
  compareFunction,
  hasConflict,
  merge,
  generateSubSchedules,
  generateSchedules,
} = require("./scheduler");

describe("cartesianProduct has correct functionality", () => {
  test("cartesianProduct works for an empty array", () => {
    expect(cartesianProduct([])).toEqual([]);
  });

  test("cartesianProduct for single array returns single array with same element", () => {
    expect(cartesianProduct([1])).toEqual([1]);
  });

  test("cartesianProduct works correctly", () => {
    const result = cartesianProduct([1, 2], [3, 4]);
    expect(result).toHaveLength(4);
    expect(result).toEqual([
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
    ]);
  });

  test("cartesianProduct returns flattened result when one argument is a 2D array", () => {
    const sections = ["s1", "s2"];
    const labs = [
      ["l1", "l2"],
      ["t1", "t2"],
    ];
    const result = cartesianProduct(sections, labs);
    expect(result).toHaveLength(4);
    expect(result.every((row) => row.length === 3)).toBe(true);
  });

  test("cartesianProduct works for nested arrays", () => {
    const sections = [["s1", "s2"]];
    const labs = [["l1", "l2"]];
    const result = cartesianProduct(sections, labs);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(["s1", "s2", "l1", "l2"]);
  });
});

describe("convertTo24Hourconverts AM/PM time string format into 24 hour string format", () => {
  test("convertTo24Hour has basic functionality", () => {
    expect(convertTo24Hour("1:32pm")).toEqual("13:32");
  });

  test("convertTo24Hour works when time and modifier are spaced", () => {
    expect(convertTo24Hour("1:00 pm")).toEqual("13:00");
  });

  test("convertTo24Hour works for midnight", () => {
    expect(convertTo24Hour("12:00am")).toEqual("00:00");
  });

  test("convertTo24Hour works for times before mid day", () => {
    expect(convertTo24Hour("3:00 am")).toEqual("03:00");
  });

  test("convertTo24Hour works for times after mid day", () => {
    expect(convertTo24Hour("3:00 pm")).toEqual("15:00");
  });

  test("convertTo24Hour adds leading 0 to hour when hour is single digit", () => {
    expect(convertTo24Hour("7:00 am").split(":")[0]).toEqual("07");
  });

  test("convertTo24Hour adds leading 0 to minute when minute is single digit", () => {
    expect(convertTo24Hour("3:09 am").split(":")[1]).toEqual("09");
  });
});

describe("compareFunction function compares times correctly", () => {
  let node1, node2;
  const generateNodes = () => [
    new ScheduleNode([], "", "", "", "", 0),
    new ScheduleNode([], "", "", "", "", 0),
  ];
  beforeAll(() => {
    [node1, node2] = generateNodes();
  });
  // start and end times must all be in 24 hour format
  /**
   * there are five possible time combin ations involving two time intervals
   * let s1 and e1 be the start and end time for the first node respectively
   * let s2 and e2 be the start and end time for the second node respectively
   * CASE 1: s1 < s2 (node 1 starts before node two)
   * CASE 2: s1 > s2 (node 1 starts after node 2)
   * CASE 3: (s1 = s2) and e1 < e2 (node 1 and node 2 start at the same time but node one finishes first)
   * CASE 3: (s1 = s2) and e1 > e2 (node 1 and node 2 start at the same time but node two finishes first)
   * CASE 3: (s1 = s2) and e1 = e2 (node 1 and node 2 start and end at the same time)
   */
  test("compareFunction returns negative if first node starts before the second node", () => {
    node1.startTime = "07:00";
    node1.endTime = "08:00";
    node2.startTime = "07:01";
    node2.endTime = "08:00";
    expect(compareFunction(node1, node2)).toBeLessThan(0);
  });

  test("compareFunction returns positive if first node starts after the second node", () => {
    node1.startTime = "11:00";
    node1.endTime = "08:00";
    node2.startTime = "07:01";
    node2.endTime = "08:00";
    expect(compareFunction(node1, node2)).toBeGreaterThan(0);
  });

  test("compareFunction returns negative if both nodes start at the same time but first node ends before the second node", () => {
    node1.startTime = "07:00";
    node1.endTime = "08:00";
    node2.startTime = "07:00";
    node2.endTime = "08:01";
    expect(compareFunction(node1, node2)).toBeLessThan(0);
  });

  test("compareFunction returns positive if both nodes start at the same time but first node ends after the second node", () => {
    node1.startTime = "07:00";
    node1.endTime = "12:00";
    node2.startTime = "07:00";
    node2.endTime = "08:01";
    expect(compareFunction(node1, node2)).toBeGreaterThan(0);
  });

  test("compareFunction returns 0 if both nodes start and end at the same times", () => {
    node1.startTime = "19:00";
    node1.endTime = "23:00";
    node2.startTime = "19:00";
    node2.endTime = "23:00";
    expect(compareFunction(node1, node2)).toBe(0);
  });
});

describe("hasConflict coorectly indicates if a schedule has conflicts", () => {
  const nodes = [];
  const length = 5;
  const init = (node, days, startTime, endTime) => {
    node.days = new Set(days);
    node.startTime = startTime;
    node.endTime = endTime;
  };

  beforeAll(() => {
    for (let i = 0; i < length; i++) {
      nodes.push(new ScheduleNode([], "", "", "", "", 0));
    }
  });

  test("hasConflict indicates that empty schedules do not have conflicts", () => {
    expect(hasConflict([])).toBe(false);
  });

  test("hasConflict returns false for schedule with only one node", () => {
    init(nodes[1], [daysOfWeek.Monday, daysOfWeek.Friday], "09:00", "10:00");
    expect(hasConflict([nodes[1]])).toBe(false);
  });

  test("hasConflict returns false for non overlapping schedules", () => {
    init(nodes[0], [daysOfWeek.Monday, daysOfWeek.Friday], "09:00", "10:00");
    init(nodes[1], [daysOfWeek.Tuesday, daysOfWeek.Thursday], "10:00", "10:50");
    init(nodes[2], [daysOfWeek.Wednesday], "10:15", "11:30");
    init(
      nodes[3],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    init(nodes[4], [daysOfWeek.Thursday], "11:00", "12:00");
    expect(hasConflict(nodes)).toBe(false);
  });

  test("hasConflict returns true for overlapping schedules", () => {
    init(nodes[0], [daysOfWeek.Monday, daysOfWeek.Friday], "09:00", "10:00");
    init(nodes[2], [daysOfWeek.Wednesday], "10:15", "14:30");
    init(
      nodes[3],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    init(nodes[4], [daysOfWeek.Thursday], "11:00", "12:00");
    expect(hasConflict(nodes)).toBe(true);
  });

  test("hasConflict returns true for overlapping schedules (same days same times)", () => {
    init(
      nodes[3],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    expect(hasConflict([nodes[3], nodes[3]])).toBe(true);
  });

  test("hasConflict returns false for non overlapping schedules (same days different times)", () => {
    init(
      nodes[0],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    init(
      nodes[3],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "16:00",
      "17:00"
    );
    expect(hasConflict([nodes[3], nodes[0]])).toBe(false);
  });

  test("hasConflict returns false for non overlapping schedules (different days same times)", () => {
    init(
      nodes[0],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    init(nodes[3], [daysOfWeek.Thursday, daysOfWeek.Tuesday], "16:00", "17:00");
    expect(hasConflict([nodes[3], nodes[0]])).toBe(false);
  });

  test("hasConflict returns false overlapping boundaries", () => {
    init(nodes[0], [daysOfWeek.Monday, daysOfWeek.Wednesday], "14:00", "15:00");
    init(nodes[3], [daysOfWeek.Monday, daysOfWeek.Wednesday], "15:00", "17:00");
    expect(hasConflict([nodes[3], nodes[0]])).toBe(true);
  });

  test("hasConflict returns true for close butnon overlapping boundaries", () => {
    init(nodes[0], [daysOfWeek.Monday, daysOfWeek.Wednesday], "14:00", "15:00");
    init(nodes[3], [daysOfWeek.Monday, daysOfWeek.Wednesday], "15:01", "17:00");
    init(nodes[3], [daysOfWeek.Monday, daysOfWeek.Wednesday], "17:02", "19:00");
    expect(hasConflict([nodes[3], nodes[0]])).toBe(false);
  });
});

describe("merge combines two schedules correctly" + " A SCHEDULE IS AN ARRAY OF NODES".yellow, () => {
  // merge takes two array of schedules and schedules are an array
  const nodes = [];
  const length = 7;
  const init = (node, days, startTime, endTime, isLab = false) => {
    node.days = new Set(days);
    node.startTime = startTime;
    node.endTime = endTime;
    this.isLab = isLab;
  };

  beforeAll(() => {
    for (let i = 0; i < length; i++) {
      nodes.push(new ScheduleNode([], "", "", "", "", 0));
    }
    init(
      nodes[0],
      [daysOfWeek.Monday, daysOfWeek.Wednesday, daysOfWeek.Friday],
      "14:00",
      "15:00"
    );
    init(nodes[1], [daysOfWeek.Tuesday, daysOfWeek.Thursday], "14:00", "15:00");
    init(nodes[2], [daysOfWeek.Wednesday], "16:00", "17:00");
    init(nodes[3], [daysOfWeek.Monday, daysOfWeek.Thursday], "07:00", "09:00");
    init(nodes[4], [daysOfWeek.Thursday], "14:00", "15:00");
    init(
      nodes[5],
      [daysOfWeek.Thursday, daysOfWeek.Friday],
      "07:00",
      "08:50",
      true
    );
    init(
      nodes[6],
      [daysOfWeek.Thursday, daysOfWeek.Wednesday, daysOfWeek.Thursday],
      "00:00",
      "23:59",
      true
    );
  });

  test("merge returns empty schedule array if either schdeule array is empty", () => {
    expect(
      merge(
        [],
        [
          new ScheduleNode(
            [daysOfWeek.Monday],
            "09:00",
            "09:50",
            "CMSC",
            "100",
            0
          ),
        ]
      )
    ).toHaveLength(0);
    expect(
      merge(
        [
          new ScheduleNode(
            [daysOfWeek.Monday],
            "09:00",
            "09:50",
            "CMSC",
            "100",
            0
          ),
        ],
        []
      )
    ).toHaveLength(0);
  });

  test("merge returns empty schedule if both are empty", () => {
    expect(merge([], [])).toEqual([]);
  });

  test("merge returns correct value for one schedule arguments (one to one) conflict free", () => {
    const mergedResult = merge([[nodes[1]]], [[nodes[2]]]);
    expect(mergedResult).toHaveLength(1);
    expect(Array.isArray(mergedResult[0])).toBe(true);
  });

  test("merge returns correct value for multiple schedule arguments (many to many) conflict free", () => {
    const mergedResult = merge(
      [[nodes[1]], [nodes[0]]],
      [[nodes[2]], [nodes[3]]]
    );
    expect(mergedResult).toHaveLength(4);
    mergedResult.forEach((schedule) => {
      expect(schedule).toHaveLength(2);
    });
  });

  test("merge returns correct value for multiple schedule arguments (many to one) conflict free", () => {
    const mergedResult = merge([[nodes[1], nodes[0]]], [[nodes[3]]]);
    expect(mergedResult).toHaveLength(1);
    mergedResult.forEach((schedule) => {
      expect(schedule).toHaveLength(3);
    });
  });

  test("merge returns empty array when there is conflict between all schedules", () => {
    const mergedResults = merge(
      [
        [nodes[0], nodes[1]],
        [nodes[2], nodes[3]],
      ],
      [
        [nodes[4], nodes[6]],
        [nodes[5], nodes[6]],
      ]
    );
    expect(mergedResults).toHaveLength(0)
  });

  test("merge returns empty array when there is conflict between some schedules", () => {
    const mergedResults = merge(
      [
        [nodes[0], nodes[2]],
        [nodes[0], nodes[1]],
      ],
      [
        [nodes[3], nodes[6]],
        [nodes[3], nodes[4]],
      ]
    );
    expect(mergedResults.length).toBeGreaterThan(0)
  });

  test("merge returns conflict free schedules", () => {
    const mergedResults = merge(
      [
        [nodes[0], nodes[1]],
        [nodes[5]],
      ],
      [
        [nodes[3], nodes[2]],
      ]
    );
    expect(mergedResults.length).toBeGreaterThan(0)
    mergedResults.forEach(schedule => {
      // check that the schedule does not have conflicts
      /**
       * Algorithm used in testing:
         loop through every schedule. compare each node in a schedule with every other node
         if there is any overlap then the merge has failed
       */
      let nonConflicting = true
      for(let node1 of schedule){
        for(let node2 of schedule){
          if(node1 === node2) continue
          const commonDays = new Set([...node1.days].filter(day => node2.days.has(day)))
          if(commonDays.keys().length === 0) continue
          nonConflicting =( node2.endTime < node1.startTime) || (node2.startTime > node1.endTime)
        }
      }
      expect(nonConflicting).toBe(true)
    })
  });

  test("merge catches slip (when the arguments themselves have conflicts)", () => {
    expect(merge([[nodes[1], nodes[4]]], [[nodes[0]]])).toEqual([]);
  });

  test("merge of two empty schedules should give an empty schedule", () => {
    expect(merge([[]], [[]])).toHaveLength(1)
    expect(merge([[]], [[]])[0]).toHaveLength(0)
  })

  test("merge with a full schedule and an empty schedule gives the full schedule", () => {
    const schedule = [nodes[0], nodes[1], nodes[2], nodes[3]]
    expect(merge([[]], [schedule])).toEqual([schedule])
  })
});


describe("generateSubSchedules works correctly", () => {
  test("")
})