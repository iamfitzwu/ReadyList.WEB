import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Button, Modal, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import * as XLSX from 'xlsx';

dayjs.extend(utc);
dayjs.extend(timezone);

const apiClient = axios.create({
  baseURL: import.meta.env.SERVER_URL || '',
  headers: {
    'X-API-KEY': import.meta.env.TOKEN_KEY || ''
  }
});

const ReadyCheck = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportRange, setExportRange] = useState({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs()
  });

  const allEcologies = ['RAIN.L', 'ANSON.G', 'MARS.PENG', 'TOM.L', 'BERTON.L', 'CARRY.Y'];

  const getDisplayDate = (date) => {
    const shanghaiTime = date.tz('Asia/Shanghai');
    const currentHour = shanghaiTime.hour();
    
    if (currentHour < 15)
      return shanghaiTime.subtract(1, 'day');
    
    return shanghaiTime;
  };

  useEffect(() => {
    const initialDate = getDisplayDate(dayjs().tz('Asia/Shanghai'));
    fetchData(initialDate);
  }, []);

  const fetchData = async (date = selectedDate) => {
    setLoading(true);
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const url = `/api/ReadyTime/duty/persons?date=${formattedDate}`;
      console.log('請求 URL:', url);
      console.log('查詢日期:', formattedDate);
      const response = await apiClient.get(url);
      console.log('響應數據:', response.data);
      
      const responseData = response.data?.data || [];
      console.log('處理後的數據:', responseData);
      const processedData = allEcologies.map(ecology => {
        const found = responseData.find(item => item.ecology === ecology);
        if (found) {
          return {
            key: ecology,
            ecology: found.ecology,
            dutyPerson: found.dutyPerson,
            readyTime: dayjs.utc(found.readyTime).format('YYYY-MM-DD HH:mm'),
          };
        }
        return {
          key: ecology,
          ecology: ecology,
          dutyPerson: '無',
          readyTime: '無',
        };
      });

      setData(processedData);
    } catch (error) {
      console.error('獲取數據失敗:', error);
      message.error('獲取數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const start = exportRange.startDate.format('YYYY-MM-DD');
      const end = exportRange.endDate.format('YYYY-MM-DD');
      
      const dateRange = [];
      let currentDate = exportRange.startDate.clone().startOf('day');
      const endDate = exportRange.endDate.clone().startOf('day');
      
      while (currentDate.format('YYYY-MM-DD') <= endDate.format('YYYY-MM-DD')) {
        dateRange.push(currentDate.clone());
        currentDate = currentDate.add(1, 'day');
      }
      
      console.log('導出日期範圍:', dateRange.map(d => d.format('YYYY-MM-DD')));
      
      const responses = await Promise.all(
        dateRange.map(date => 
          apiClient.get(`/api/ReadyTime/duty/persons?date=${date.format('YYYY-MM-DD')}`)
        )
      );
      
      const exportData = dateRange.flatMap((date, index) => {
        const responseData = responses[index]?.data?.data || [];
        return allEcologies.map(ecology => {
          const found = responseData.find(item => item.ecology === ecology);
          if (found) {
            return {
              '日期': dayjs(found.date).format('YYYY-MM-DD'),
              '所屬5M生態': found.ecology,
              'ON CALL人員': found.dutyPerson,
              'ready時間': dayjs.utc(found.readyTime).format('HH:mm')
            };
          }
          return {
            '日期': date.format('YYYY-MM-DD'),
            '所屬5M生態': ecology,
            'ON CALL人員': '無',
            'ready時間': '無'
          };
        });
      });
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "ReadyCheck數據");
      XLSX.writeFile(wb, `ReadyCheck_${start}_至_${end}.xlsx`);
      
      message.success('導出成功');
    } catch (error) {
      console.error('導出失敗:', error);
      message.error('導出失敗');
    } finally {
      setLoading(false);
      setExportModalVisible(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSearch = () => {
    if (selectedDate) {
      fetchData(selectedDate);
    }
  };

  const columns = [
    {
      title: '所屬5M生態',
      dataIndex: 'ecology',
      key: 'ecology',
      align: 'center',
    },
    {
      title: 'ON CALL人員',
      dataIndex: 'dutyPerson',
      key: 'dutyPerson',
      align: 'center',
    },
    {
      title: 'ready時間(CST)',
      dataIndex: 'readyTime',
      key: 'readyTime',
      align: 'center',
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '90%',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flex: 1 }}>
            <h1 style={{ 
              margin: 0,
              fontSize: '24px',
              color: '#1890ff',
              fontWeight: '500'
            }}>
              Ready Check List
            </h1>
            <div style={{
              fontSize: '12px',
              color: '#8c8c8c',
              lineHeight: '1.5',
              paddingBottom: '2px'
            }}>
              若當前無ON CALL人員名單表示ON CALL人員未ready，如需ON CALL支持請聯繫對應生態5M。
            </div>
          </div>
          <div style={{ 
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <DatePicker 
              value={selectedDate}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              style={{ 
                width: '200px',
                borderRadius: '6px'
              }}
              placeholder="請選擇日期"
            />
            <Button 
              type="primary"
              onClick={handleSearch}
              style={{ 
                borderRadius: '6px'
              }}
            >
              查詢
            </Button>
            <Button 
              type="primary"
              onClick={() => setExportModalVisible(true)}
              style={{ borderRadius: '6px' }}
            >
              導出Excel
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          bordered
          style={{ width: '100%' }}
        />
      </div>

      <Modal
        title="選擇導出日期範圍"
        visible={exportModalVisible}
        onOk={exportToExcel}
        onCancel={() => setExportModalVisible(false)}
        okText="確認導出"
        cancelText="取消"
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <DatePicker
            value={exportRange.startDate}
            onChange={date => setExportRange({...exportRange, startDate: date})}
            format="YYYY-MM-DD"
            placeholder="開始日期"
          />
          <span>至</span>
          <DatePicker
            value={exportRange.endDate}
            onChange={date => setExportRange({...exportRange, endDate: date})}
            format="YYYY-MM-DD"
            placeholder="結束日期"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReadyCheck;