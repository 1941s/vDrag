<template>
  <div class="window-container">
    <div class="window-header">
      <h2>窗口显示</h2>
      <div class="window-controls">
        <el-select v-model="currentWindow" placeholder="请选择窗口">
          <el-option
            v-for="item in windowOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
    </div>
    
    <div class="window-content">
      <div class="window-display">
        <div class="window-number">
          <div class="number-title">窗口号</div>
          <div class="number">{{ currentWindow }}</div>
        </div>
        
        <div class="ticket-info" v-if="currentTicket">
          <div class="ticket-title">当前票号</div>
          <div class="ticket-number" :class="{ 'blink': isProcessing }">{{ currentTicket.ticketNo }}</div>
          <div class="ticket-status">
            <el-tag :type="getStatusType(currentTicket.status)">{{ getStatusText(currentTicket.status) }}</el-tag>
          </div>
        </div>
        
        <div class="no-ticket" v-else>
          <i class="el-icon-s-order"></i>
          <div>暂无票号</div>
        </div>
      </div>
      
      <div class="operation-panel">
        <h3>操作面板</h3>
        <div class="operation-buttons">
          <el-button type="primary" @click="callNext" :disabled="isProcessing">叫号</el-button>
          <el-button type="success" @click="complete" :disabled="!isProcessing">完成</el-button>
          <el-button type="warning" @click="recall" :disabled="!currentTicket">重呼</el-button>
          <el-button type="danger" @click="skip" :disabled="!isProcessing">跳过</el-button>
        </div>
        
        <div class="waiting-list">
          <h4>等待队列 ({{ waitingTickets.length }})</h4>
          <el-table
            :data="waitingTickets"
            style="width: 100%"
            max-height="250">
            <el-table-column
              prop="ticketNo"
              label="票号"
              width="120">
            </el-table-column>
            <el-table-column
              prop="time"
              label="取票时间">
              <template slot-scope="scope">
                {{ formatTime(scope.row.time) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="120">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="callSpecific(scope.row)">叫号</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Window',
  data() {
    return {
      currentWindow: 1,
      windowOptions: [
        { value: 1, label: '1号窗口' },
        { value: 2, label: '2号窗口' },
        { value: 3, label: '3号窗口' },
        { value: 4, label: '4号窗口' }
      ],
      currentTicket: null,
      isProcessing: false,
      waitingTickets: [],
      processedTickets: [],
      // 模拟票号前缀
      ticketPrefix: 'A',
      counter: 1001
    }
  },
  created() {
    // 生成一些模拟数据
    this.generateMockData();
  },
  methods: {
    // 生成模拟数据
    generateMockData() {
      // 清空等待队列
      this.waitingTickets = [];
      
      // 生成10个模拟票号
      for (let i = 0; i < 10; i++) {
        this.waitingTickets.push({
          id: i + 1,
          ticketNo: this.ticketPrefix + (this.counter + i),
          time: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
          status: 'waiting'
        });
      }
      
      // 按时间排序
      this.waitingTickets.sort((a, b) => a.time - b.time);
    },
    
    // 叫下一个号
    callNext() {
      if (this.waitingTickets.length > 0) {
        this.currentTicket = this.waitingTickets.shift();
        this.currentTicket.status = 'processing';
        this.isProcessing = true;
        
        // 模拟发送叫号指令到显示屏
        this.sendToDisplay(this.currentTicket, this.currentWindow);
      }
    },
    
    // 完成当前票号
    complete() {
      if (this.currentTicket) {
        this.currentTicket.status = 'completed';
        this.processedTickets.push(this.currentTicket);
        this.currentTicket = null;
        this.isProcessing = false;
      }
    },
    
    // 重新呼叫当前票号
    recall() {
      if (this.currentTicket) {
        // 模拟发送叫号指令到显示屏
        this.sendToDisplay(this.currentTicket, this.currentWindow);
      }
    },
    
    // 跳过当前票号
    skip() {
      if (this.currentTicket) {
        this.currentTicket.status = 'skipped';
        this.processedTickets.push(this.currentTicket);
        this.currentTicket = null;
        this.isProcessing = false;
      }
    },
    
    // 叫指定票号
    callSpecific(ticket) {
      if (this.isProcessing) {
        this.$confirm('当前窗口正在处理票号，是否结束当前处理并叫新票号?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.complete();
          this.processCallSpecific(ticket);
        }).catch(() => {
          // 用户取消
        });
      } else {
        this.processCallSpecific(ticket);
      }
    },
    
    // 处理叫指定票号
    processCallSpecific(ticket) {
      // 从等待队列中移除
      const index = this.waitingTickets.findIndex(t => t.id === ticket.id);
      if (index !== -1) {
        this.waitingTickets.splice(index, 1);
      }
      
      this.currentTicket = ticket;
      this.currentTicket.status = 'processing';
      this.isProcessing = true;
      
      // 模拟发送叫号指令到显示屏
      this.sendToDisplay(this.currentTicket, this.currentWindow);
    },
    
    // 发送叫号指令到显示屏
    sendToDisplay(ticket, windowNo) {
      console.log(`向显示屏发送叫号指令: 票号${ticket.ticketNo} 到 ${windowNo}号窗口`);
      
      // 实际项目可能通过websocket或其他方式发送到显示屏
    },
    
    // 获取状态类型
    getStatusType(status) {
      switch (status) {
        case 'waiting':
          return 'info';
        case 'processing':
          return 'primary';
        case 'completed':
          return 'success';
        case 'skipped':
          return 'danger';
        default:
          return 'info';
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case 'waiting':
          return '等待中';
        case 'processing':
          return '处理中';
        case 'completed':
          return '已完成';
        case 'skipped':
          return '已跳过';
        default:
          return '未知状态';
      }
    },
    
    // 格式化时间
    formatTime(time) {
      return this.$moment(time).format('HH:mm:ss');
    }
  }
}
</script>

<style scoped>
.window-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.window-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}

.window-content {
  flex: 1;
  display: flex;
  padding: 20px;
  background-color: #f5f5f5;
  overflow: auto;
}

.window-display {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  padding: 30px;
}

.operation-panel {
  width: 380px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.window-number {
  text-align: center;
  margin-bottom: 40px;
}

.number-title {
  font-size: 24px;
  color: #606266;
  margin-bottom: 10px;
}

.number {
  font-size: 64px;
  font-weight: bold;
  color: #409EFF;
}

.ticket-info {
  text-align: center;
}

.ticket-title {
  font-size: 24px;
  color: #606266;
  margin-bottom: 10px;
}

.ticket-number {
  font-size: 72px;
  font-weight: bold;
  color: #ff0000;
  margin-bottom: 20px;
}

.ticket-number.blink {
  animation: blink 1s infinite;
}

.no-ticket {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.no-ticket i {
  font-size: 64px;
  margin-bottom: 20px;
}

.operation-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.waiting-list {
  flex: 1;
  overflow: auto;
}

h3, h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style> 