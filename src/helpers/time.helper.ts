import moment, { Moment, MomentInput } from 'moment';

const TimeHelper = {
  moment(inp?: MomentInput): Moment {
    return moment(inp);
  },
  date(inp?: MomentInput): Date {
    return moment(inp).toDate();
  },
  formatFileName: 'YYYYMMDD-HHmmss',
  formatDate: 'YYYY-MM-DD',
};

export default TimeHelper;
