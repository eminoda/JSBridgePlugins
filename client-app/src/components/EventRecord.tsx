import { NoticeBar, Space, Tag } from "antd-mobile";
function EventRecord(props: { type: string; seqId: string; title: string; content: string }) {
  return (
    <>
      <NoticeBar
        wrap
        color={props.type == "toNative" ? "info" : "alert"}
        icon=""
        content={
          <Space direction="vertical">
            <Space>
              <Tag color="primary" fill="outline">
                {props.title}
              </Tag>
              <Tag>{props.seqId}</Tag>
            </Space>
            {props.content}
          </Space>
        }
      />
    </>
  );
}

export default EventRecord;
