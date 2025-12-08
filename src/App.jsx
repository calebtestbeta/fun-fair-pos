import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  History, 
  Settings, 
  Plus, 
  Minus, 
  Search, 
  CreditCard, 
  Monitor, 
  Package, 
  QrCode,
  Volume2,
  AlertCircle,
  XCircle,
  Edit3,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  Calculator,
  Coins,
  RefreshCw,
  Box,
  Save,
  RotateCcw,
  Upload,
  FileText,
  Delete,
  FileDown,
  Keyboard,
  ScanLine, 
  CheckSquare,
  ArchiveRestore,
  FolderOpen // 新增圖示
} from 'lucide-react';

// --- 跨平台日期工具函數 ---
const DateUtils = {
  // 解析時間字串為 Date 物件（向後兼容，增強版）
  parseTime: (timeStr) => {
    try {
      // 如果已經是 Date 物件，直接返回
      if (timeStr instanceof Date) {
        return timeStr;
      }

      // 如果是數字（timestamp），直接轉換
      if (typeof timeStr === 'number' || !isNaN(Number(timeStr))) {
        const date = new Date(Number(timeStr));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // 首先嘗試直接解析
      let date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // 如果是字串，嘗試各種常見的本地化格式
      if (typeof timeStr === 'string') {
        const cleanStr = timeStr.trim();

        // 嘗試常見的格式變換
        const formats = [
          cleanStr,
          // 處理中文格式：2025年12月8日 -> 2025/12/8
          cleanStr.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, ''),
          // 處理各種分隔符
          cleanStr.replace(/\//g, '-'),
          cleanStr.replace(/-/g, '/'),
          cleanStr.replace(/\./g, '/'),
          // 移除時區信息
          cleanStr.replace(/\s*GMT.*$/, ''),
          cleanStr.replace(/\s*UTC.*$/, ''),
        ];

        for (const format of formats) {
          try {
            date = new Date(format);
            if (!isNaN(date.getTime())) {
              return date;
            }
          } catch (e) {
            // 忽略個別格式的錯誤，繼續嘗試下一個
          }
        }
      }

      // 如果所有方法都失敗，回傳當前時間並警告
      console.warn('日期解析失敗，使用當前時間作為備用:', timeStr);
      return new Date();
    } catch (e) {
      console.warn('日期解析發生異常:', timeStr, e);
      return new Date();
    }
  },

  // 獲取日期的數值組件（年月日）
  getDateComponents: (dateInput) => {
    const date = DateUtils.parseTime(dateInput);
    return {
      year: date.getFullYear(),
      month: date.getMonth(), // 0-11
      day: date.getDate()     // 1-31
    };
  },

  // 比較兩個日期是否為同一天（使用數值比較，最可靠）
  isSameDay: (date1, date2) => {
    try {
      const d1 = DateUtils.getDateComponents(date1);
      const d2 = DateUtils.getDateComponents(date2);
      return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
    } catch (e) {
      console.warn('日期比較失敗:', date1, date2, e);
      return false;
    }
  },

  // 檢查日期是否為今日 - 🔧 超強健版本
  isToday: (dateInput) => {
    try {
      const inputDate = DateUtils.parseTime(dateInput);
      const today = new Date();

      // 三重驗證確保準確性
      const method1 = DateUtils.isSameDay(inputDate, today);
      const method2 = DateUtils.formatDate(inputDate) === DateUtils.formatDate(today);
      const method3 = inputDate.toDateString() === today.toDateString();

      console.debug('isToday 三重驗證:', {
        input: dateInput,
        parsed: inputDate,
        today: today,
        method1_numeric: method1,
        method2_formatted: method2,
        method3_datestring: method3,
        consensus: method1 || method2 || method3 // 只要有一個方法認為是今天就算今天
      });

      return method1 || method2 || method3;
    } catch (e) {
      console.warn('isToday 檢查失敗:', dateInput, e);
      return false;
    }
  },

  // 標準化日期為 YYYY-MM-DD 格式（用於顯示和調試）
  formatDate: (dateInput) => {
    try {
      const date = DateUtils.parseTime(dateInput);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.warn('日期格式化失敗:', dateInput, e);
      return DateUtils.formatDate(new Date());
    }
  },

  // 獲取今日日期字串
  getTodayString: () => {
    return DateUtils.formatDate(new Date());
  }
};

// --- MOCK DATA: 預設商品清單 ---
const INITIAL_PRODUCTS = [
  { id: 101, name: "烤香腸", price: 35, category: "熱食", barcode: "101", stock: 100 },
  { id: 102, name: "大腸包小腸", price: 60, category: "熱食", barcode: "102", stock: 50 },
  { id: 103, name: "炒米粉", price: 50, category: "熱食", barcode: "103", stock: 50 },
  { id: 104, name: "貢丸湯", price: 30, category: "熱食", barcode: "104", stock: 80 },
  { id: 105, name: "鹹酥雞", price: 80, category: "熱食", barcode: "105", stock: 40 },
  { id: 106, name: "章魚燒", price: 60, category: "熱食", barcode: "106", stock: 40 },
  { id: 107, name: "滷味拼盤", price: 100, category: "熱食", barcode: "107", stock: 30 },
  { id: 108, name: "烤玉米", price: 70, category: "熱食", barcode: "108", stock: 50 },
  { id: 201, name: "古早味紅茶", price: 25, category: "飲料", barcode: "201", stock: 200 },
  { id: 202, name: "珍珠奶茶", price: 50, category: "飲料", barcode: "202", stock: 100 },
  { id: 203, name: "冬瓜檸檬", price: 40, category: "飲料", barcode: "203", stock: 100 },
  { id: 204, name: "彈珠汽水", price: 30, category: "飲料", barcode: "204", stock: 60 },
  { id: 205, name: "鮮榨柳橙汁", price: 60, category: "飲料", barcode: "205", stock: 50 },
  { id: 206, name: "礦泉水", price: 10, category: "飲料", barcode: "206", stock: 120 },
  { id: 207, name: "運動飲料", price: 25, category: "飲料", barcode: "207", stock: 60 },
  { id: 301, name: "雞蛋糕", price: 40, category: "點心", barcode: "301", stock: 80 },
  { id: 302, name: "霜淇淋", price: 35, category: "點心", barcode: "302", stock: 100 },
  { id: 303, name: "棉花糖", price: 30, category: "點心", barcode: "303", stock: 50 },
  { id: 304, name: "爆米花", price: 40, category: "點心", barcode: "304", stock: 50 },
  { id: 305, name: "糖葫蘆", price: 35, category: "點心", barcode: "305", stock: 40 },
  { id: 306, name: "車輪餅", price: 20, category: "點心", barcode: "306", stock: 80 },
  { id: 401, name: "套圈圈(1局)", price: 50, category: "遊戲", barcode: "401", stock: 999 },
  { id: 402, name: "撈金魚", price: 50, category: "遊戲", barcode: "402", stock: 999 },
  { id: 403, name: "射氣球", price: 100, category: "遊戲", barcode: "403", stock: 999 },
  { id: 404, name: "抽抽樂", price: 10, category: "遊戲", barcode: "404", stock: 200 },
  { id: 405, name: "打彈珠", price: 20, category: "遊戲", barcode: "405", stock: 999 },
  { id: 406, name: "DIY 手作包", price: 150, category: "其他", barcode: "406", stock: 20 },
  { id: 407, name: "紀念徽章", price: 30, category: "其他", barcode: "407", stock: 50 },
];

// --- MOCK DATA: Demo 模式用的資料 ---
const DEMO_PRODUCTS = [
  { id: 101, name: "烤香腸", price: 35, category: "熱食", barcode: "101", stock: 80 },
  { id: 102, name: "大腸包小腸", price: 60, category: "熱食", barcode: "102", stock: 45 },
  { id: 103, name: "炒米粉", price: 50, category: "熱食", barcode: "103", stock: 50 },
  { id: 105, name: "鹹酥雞", price: 80, category: "熱食", barcode: "105", stock: 30 },
  { id: 201, name: "古早味紅茶", price: 25, category: "飲料", barcode: "201", stock: 150 },
  { id: 202, name: "珍珠奶茶", price: 50, category: "飲料", barcode: "202", stock: 90 },
  { id: 301, name: "雞蛋糕", price: 40, category: "點心", barcode: "301", stock: 70 },
  { id: 302, name: "霜淇淋", price: 35, category: "點心", barcode: "302", stock: 80 },
  { id: 401, name: "套圈圈(1局)", price: 50, category: "遊戲", barcode: "401", stock: 999 },
  { id: 901, name: "Demo限定商品", price: 99, category: "其他", barcode: "901", stock: 20 },
];

const DEMO_TRANSACTIONS = (() => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // 🔧 直接使用 ISO 標準格式，避免本地化差異
  const formatTime = (date) => {
    // 使用 ISO 格式但轉為本地時區顯示
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  return [
    {
      id: 1700000001,
      time: formatTime(now),
      items: [
        { id: 101, name: "烤香腸", price: 35, qty: 2 },
        { id: 201, name: "古早味紅茶", price: 25, qty: 1 }
      ],
      total: 95, received: 100, change: 5, status: 'completed'
    },
    {
      id: 1700000002,
      time: formatTime(now),
      items: [
        { id: 102, name: "大腸包小腸", price: 60, qty: 1 },
        { id: 301, name: "雞蛋糕", price: 40, qty: 2 }
      ],
      total: 140, received: 150, change: 10, status: 'completed'
    },
    {
      id: 1700000003,
      time: formatTime(yesterday),
      items: [
        { id: 202, name: "珍珠奶茶", price: 50, qty: 1 },
        { id: 901, name: "Demo限定商品", price: 99, qty: 1 }
      ],
      total: 149, received: 150, change: 1, status: 'completed'
    },
    {
      id: 1700000004,
      time: formatTime(yesterday),
      items: [
        { id: 401, name: "套圈圈(1局)", price: 50, qty: 3 }
      ],
      total: 150, received: 200, change: 50, status: 'completed'
    }
  ];
})();

const DEMO_IMPORTED_SNAPSHOT = JSON.parse(JSON.stringify(DEMO_PRODUCTS));

const BARCODE_FORMATS = [
  { id: 'CODE39', name: 'Code 39', desc: '園遊會券/識別證常用 (支援英文+數字)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'EAN13', name: 'EAN-13', desc: '一般零售商品 (13位數字)', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'CODE128', name: 'Code 128', desc: '高密度通用格式 (物流/倉儲)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'ANY', name: '不限制', desc: '接受所有格式', color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v1',
  TRANSACTIONS: 'pos_transactions_v1',
  SETTINGS: 'pos_settings_v1',
  IMPORTED_SNAPSHOT: 'pos_imported_snapshot_v1',
  // Demo Mode Keys
  IS_DEMO_MODE: 'pos_is_demo_mode',
  PRODUCTS_DEMO: 'pos_products_demo_v1',
  TRANSACTIONS_DEMO: 'pos_transactions_demo_v1',
  IMPORTED_SNAPSHOT_DEMO: 'pos_imported_snapshot_demo_v1'
};

const getLocalStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      console.log(`📂 LocalStorage key "${key}" 不存在，使用預設值`);
      return defaultValue;
    }

    const parsed = JSON.parse(item);

    // 🔐 資料完整性檢查
    if (key.includes('products') && Array.isArray(parsed)) {
      const isValid = parsed.every(p =>
        p && typeof p === 'object' &&
        p.id && p.name && typeof p.price === 'number' && p.price >= 0 &&
        p.category && typeof p.category === 'string' &&
        typeof p.stock === 'number' && p.stock >= 0
      );
      if (!isValid) {
        console.warn(`⚠️ LocalStorage 商品資料損毀，使用預設值: ${key}`);
        return defaultValue;
      }
      console.log(`✅ LocalStorage 商品資料驗證通過: ${key} (${parsed.length} 筆)`);
    }

    if (key.includes('transactions') && Array.isArray(parsed)) {
      const isValid = parsed.every(t =>
        t && typeof t === 'object' &&
        t.id && t.time && Array.isArray(t.items) &&
        typeof t.total === 'number' && t.total >= 0
      );
      if (!isValid) {
        console.warn(`⚠️ LocalStorage 交易資料損毀，使用預設值: ${key}`);
        return defaultValue;
      }
      console.log(`✅ LocalStorage 交易資料驗證通過: ${key} (${parsed.length} 筆)`);
    }

    return parsed;
  } catch (error) {
    console.error(`❌ Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// 🔐 安全的 localStorage 寫入函數
const setLocalStorageItem = (key, value, onError = null) => {
  try {
    const jsonString = JSON.stringify(value);

    // 檢查資料大小 (localStorage 通常限制 5-10MB)
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = sizeInBytes / 1024 / 1024;

    if (sizeInMB > 4) { // 4MB 警告閾值
      console.warn(`LocalStorage 資料過大: ${key} (${sizeInMB.toFixed(2)}MB)`);
    }

    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error(`LocalStorage 寫入失敗 "${key}":`, error);

    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage 空間不足，嘗試清理舊資料...');
      // 可選：實作自動清理機制
    }

    // 回調通知錯誤
    if (onError) {
      onError(error);
    }

    return false;
  }
};

const EMPTY_ARRAY = [];

// --- 音效引擎 ---
const playSystemSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'cash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'clear') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// --- 大數字鍵盤元件 ---
const Numpad = ({ onInput, onDelete, className = "" }) => {
  const keys = [7, 8, 9, 4, 5, 6, 1, 2, 3, '00', 0];
  
  return (
    <div className={`grid grid-cols-3 gap-3 p-4 bg-gray-100 rounded-2xl ${className}`}>
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onInput(k)}
          className="h-20 text-3xl font-black bg-white rounded-xl shadow-sm border-2 border-gray-200 text-gray-800 hover:bg-blue-50 active:scale-95 active:bg-blue-100 transition-all"
        >
          {k}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-20 flex items-center justify-center bg-red-100 rounded-xl shadow-sm border-2 border-red-200 text-red-600 hover:bg-red-200 active:scale-95 transition-all"
      >
        <Delete size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- Modal Component ---
const Modal = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  inputs = EMPTY_ARRAY,
  paymentInfo = null,
  editItems = null,
  allProducts = [],
  autoCloseDelay = null,
  onExportAction = null, // 新增：專門給匯出選單用的 callback
  editReceivedAmount = '',
  setEditReceivedAmount = () => {},
  originalTransaction = null,
  playSound = null, // 新增：音效播放函數
  onStockWarning = null // 新增：庫存警告回調函數
}) => {
  const [inputValues, setInputValues] = useState({});
  const [receivedAmount, setReceivedAmount] = useState('');
  const [currentEditItems, setCurrentEditItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [activeInput, setActiveInput] = useState(null); 
  const [useNativeKeyboard, setUseNativeKeyboard] = useState(false);

  const changeAmount = paymentInfo ? (parseInt(receivedAmount || 0) - paymentInfo.total) : 0;

  useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        if (onConfirm) onConfirm();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onConfirm]);

  useEffect(() => {
    if (isOpen) {
      if (inputs.length > 0) {
        const initialValues = inputs.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.defaultValue || '' }), {});
        setInputValues(initialValues);
        const firstNumInput = inputs.find(i => i.type === 'number' && !i.readOnly);
        if (firstNumInput) setActiveInput(firstNumInput.name);
      }
      if (editItems) {
        setCurrentEditItems(JSON.parse(JSON.stringify(editItems)));
        // 如果有原始交易資訊，預填付款金額
        if (originalTransaction && originalTransaction.received) {
          setEditReceivedAmount(originalTransaction.received.toString());
        } else {
          setEditReceivedAmount('');
        }
        setActiveInput(null);
      }
      if (type === 'payment') {
        setReceivedAmount('');
        setActiveInput('received');
      }
      setSelectedProductId('');
      setUseNativeKeyboard(false); 
    }
  }, [isOpen, inputs, editItems, type, originalTransaction, setEditReceivedAmount]);

  const handleNumpadInput = (value) => {
    const valStr = String(value);
    if (activeInput === 'received' && type === 'payment') {
      setReceivedAmount(prev => (prev + valStr).slice(0, 8));
    } else if (activeInput === 'edit-received' && type === 'edit-transaction') {
      // 新增：支援編輯模式的收錢輸入
      setEditReceivedAmount(prev => (prev + valStr).slice(0, 8));
    } else if (activeInput && type === 'input') {
      setInputValues(prev => ({ ...prev, [activeInput]: (prev[activeInput] + valStr) }));
    } else if (activeInput && activeInput.startsWith('edit-') && type === 'edit-transaction') {
      const [_, idxStr, field] = activeInput.split('-');
      const idx = parseInt(idxStr);
      if (field === 'price') {
        const currentItems = [...currentEditItems];
        const currentVal = String(currentItems[idx].price || '');
        const newVal = currentVal + valStr;
        currentItems[idx].price = parseInt(newVal) || 0;
        setCurrentEditItems(currentItems);
      }
    }
  };

  const handleNumpadDelete = () => {
    if (activeInput === 'received' && type === 'payment') {
      setReceivedAmount(prev => prev.slice(0, -1));
    } else if (activeInput === 'edit-received' && type === 'edit-transaction') {
      // 新增：支援編輯模式的收錢刪除
      setEditReceivedAmount(prev => prev.slice(0, -1));
    } else if (activeInput && type === 'input') {
      setInputValues(prev => ({ ...prev, [activeInput]: String(prev[activeInput]).slice(0, -1) }));
    } else if (activeInput && activeInput.startsWith('edit-') && type === 'edit-transaction') {
      const [_, idxStr, field] = activeInput.split('-');
      const idx = parseInt(idxStr);
      if (field === 'price') {
        const currentItems = [...currentEditItems];
        const currentVal = String(currentItems[idx].price || '');
        const newVal = currentVal.slice(0, -1);
        currentItems[idx].price = newVal === '' ? 0 : parseInt(newVal);
        setCurrentEditItems(currentItems);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });
  };

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...currentEditItems];
    const currentItem = newItems[index];

    if (field === 'qty') {
      // 🔐 庫存檢查邏輯 - 修改訂單時
      if (!currentItem.isCustom) {
        const product = allProducts.find(p => p.id === currentItem.id);

        if (product) {
          // 計算原訂單中此商品的數量（用於庫存釋放計算）
          const originalItem = originalTransaction?.items?.find(i => i.id === currentItem.id);
          const originalQty = originalItem ? originalItem.qty : 0;

          // 目前可用庫存 = 商品庫存 + 原訂單中的數量（因為修改時會釋放）
          const availableStock = product.stock + originalQty;

          // 檢查新數量是否超過可用庫存
          if (value > availableStock) {
            // 播放錯誤音效
            if (playSound) playSound('error');

            // 使用最大可用數量
            const maxAllowed = Math.max(1, availableStock);
            newItems[index] = { ...currentItem, qty: maxAllowed };
            setCurrentEditItems(newItems);

            // 顯示用戶友善的警告訊息
            if (onStockWarning) {
              onStockWarning({
                productName: currentItem.name,
                requestedQty: value,
                availableStock: availableStock,
                adjustedQty: maxAllowed
              });
            }

            return;
          }
        }
      }

      // 確保最小數量為 1
      const finalValue = Math.max(1, parseInt(value) || 1);
      newItems[index] = { ...currentItem, qty: finalValue };
    } else {
      // 處理其他欄位（如價格）
      newItems[index] = { ...currentItem, [field]: value };
    }

    setCurrentEditItems(newItems);
  };

  const handleRemoveEditItem = (index) => {
    const newItems = currentEditItems.filter((_, i) => i !== index);
    setCurrentEditItems(newItems);
  };

  const handleAddProductToEdit = () => {
    if (!selectedProductId) return;
    const productToAdd = allProducts.find(p => p.id === parseInt(selectedProductId));
    if (!productToAdd) return;

    // 🔐 庫存檢查 - 新增商品到編輯清單
    if (!productToAdd.isCustom) {
      // 計算原訂單中此商品的數量
      const originalItem = originalTransaction?.items?.find(i => i.id === productToAdd.id);
      const originalQty = originalItem ? originalItem.qty : 0;

      // 計算目前編輯清單中的數量
      const currentEditItem = currentEditItems.find(i => i.id === productToAdd.id);
      const currentEditQty = currentEditItem ? currentEditItem.qty : 0;

      // 可用庫存 = 商品庫存 + 原訂單數量 - 目前編輯清單數量
      const availableStock = productToAdd.stock + originalQty - currentEditQty;

      if (availableStock <= 0) {
        // 播放錯誤音效
        if (playSound) playSound('error');

        // 顯示用戶友善的警告訊息
        if (onStockWarning) {
          onStockWarning({
            productName: productToAdd.name,
            requestedQty: 1,
            availableStock: availableStock,
            adjustedQty: 0,
            isAddingNew: true
          });
        }

        return; // 不允許加入
      }
    }

    const newItems = [...currentEditItems];
    const existingIndex = newItems.findIndex(i => i.id === productToAdd.id);

    if (existingIndex >= 0) {
      newItems[existingIndex].qty += 1;
    } else {
      newItems.push({
        id: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.price,
        category: productToAdd.category,
        qty: 1
      });
    }

    setCurrentEditItems(newItems);
    setSelectedProductId('');
  };

  const handleConfirm = () => {
    if (type === 'payment') {
      onConfirm({ received: parseInt(receivedAmount || 0), change: changeAmount });
    } else if (type === 'edit-transaction') {
      // 傳遞商品和付款資訊
      const paymentInfo = editReceivedAmount ? {
        received: parseInt(editReceivedAmount || 0),
        change: editChangeAmount
      } : null;
      onConfirm(currentEditItems, paymentInfo);
    } else if (inputs.length > 0) {
      onConfirm(inputValues);
    } else {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  const showNumpad = type === 'input' || type === 'payment' || type === 'edit-transaction';
  const editTotal = currentEditItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const editChangeAmount = parseInt(editReceivedAmount || 0) - editTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity">
      <div className={`bg-white rounded-3xl shadow-2xl w-full animate-[fade-in_0.2s_ease-out] border-2 border-gray-200 overflow-hidden flex flex-col max-h-[95vh] ${showNumpad ? 'max-w-5xl' : 'max-w-lg'} ${type === 'export-menu' ? 'max-w-2xl' : ''}`}>
        
        {/* Header */}
        <div className={`p-6 flex items-center gap-4 ${
          type === 'danger' ? 'bg-red-100' : 
          type === 'success' ? 'bg-green-100' : 
          type === 'payment' ? 'bg-emerald-700 text-white' : 
          type === 'edit-transaction' ? 'bg-orange-100' : 
          type === 'export-menu' ? 'bg-slate-800 text-white' : 
          type === 'warning' ? 'bg-yellow-100' : // New warning type
          'bg-blue-100'
        }`}>
          {type === 'danger' && <AlertTriangle className="text-red-600" size={40} />}
          {type === 'success' && <CheckCircle className="text-green-600" size={40} />}
          {type === 'payment' && <Calculator className="text-white" size={40} />}
          {type === 'edit-transaction' && <Edit3 className="text-orange-600" size={40} />}
          {type === 'export-menu' && <FolderOpen className="text-white" size={40} />}
          {type === 'warning' && <AlertCircle className="text-yellow-600" size={40} />}
          {(type === 'info' || type === 'input') && <AlertCircle className="text-blue-600" size={40} />}
          
          <h3 className={`font-black text-3xl ${
            type === 'danger' ? 'text-red-900' : 
            type === 'success' ? 'text-green-900' : 
            type === 'payment' ? 'text-white' : 
            type === 'edit-transaction' ? 'text-orange-900' : 
            type === 'export-menu' ? 'text-white' : 
            type === 'warning' ? 'text-yellow-900' : // New warning type
            'text-blue-900'
          }`}>{title}</h3>
        </div>
        
        <div className={`flex flex-col md:flex-row h-full overflow-hidden`}>
          <div className="flex-1 p-8 overflow-y-auto">
            {message && <p className="text-gray-800 text-xl font-medium mb-6 leading-relaxed whitespace-pre-line">{message}</p>}
            
            {/* Export Menu 介面 - 🔧 園遊會單日模式 */}
            {type === 'export-menu' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-xl font-black text-blue-700 mb-6 flex items-center gap-3 border-b-2 border-blue-100 pb-3">
                    <FolderOpen size={28} /> 匯出園遊會資料
                  </h4>
                  <div className="text-center mb-6">
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 inline-block">
                      <span className="text-blue-700 font-bold text-lg">
                        📅 {DateUtils.formatDate(new Date())} 的營業資料
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => onExportAction('orders', 'today')}
                      className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 rounded-2xl transition-all active:scale-95 group"
                    >
                      <Download size={40} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xl text-blue-800">匯出訂單明細</span>
                      <span className="text-sm text-blue-600 mt-1">包含所有交易紀錄</span>
                    </button>
                    <button
                      onClick={() => onExportAction('products', 'today')}
                      className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 rounded-2xl transition-all active:scale-95 group"
                    >
                      <FileText size={40} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xl text-blue-800">匯出商品統計</span>
                      <span className="text-sm text-blue-600 mt-1">銷售量與庫存報表</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 一般輸入框 */}
            {inputs.length > 0 && (
              <div className="space-y-6 mb-6">
                {inputs.map((input) => (
                  <div key={input.name} className="relative">
                    <label className="block text-lg font-bold text-gray-700 mb-2">{input.label}</label>
                    <div className="flex gap-2">
                        <input
                        type={input.type || 'text'}
                        name={input.name}
                        value={inputValues[input.name] ?? ''}
                        onChange={handleInputChange}
                        readOnly={input.readOnly}
                        inputMode={useNativeKeyboard ? (input.type === 'number' ? 'numeric' : 'text') : 'none'}
                        onFocus={() => !input.readOnly && setActiveInput(input.name)}
                        className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none text-2xl font-bold text-gray-900 
                            ${activeInput === input.name ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'}
                            ${input.readOnly ? 'bg-gray-100 text-gray-500' : 'bg-white'}
                        `}
                        autoFocus={input.autoFocus}
                        placeholder={input.placeholder}
                        />
                        {!input.readOnly && (
                            <button
                                onClick={() => setUseNativeKeyboard(!useNativeKeyboard)}
                                className={`px-4 rounded-xl border-2 transition-colors ${useNativeKeyboard ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                                title="切換虛擬鍵盤"
                            >
                                <Keyboard size={24} />
                            </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* (省略中間的 edit-transaction 和 payment 區塊，保持原樣) */}
            {type === 'edit-transaction' && (
              <div className="space-y-6">
                <div className="flex gap-4 items-end bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-orange-700 mb-1">新增商品</label>
                    <select 
                      className="w-full p-3 border-2 border-orange-300 rounded-xl text-xl font-bold bg-white focus:outline-none focus:border-orange-500"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">請選擇商品...</option>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price}) {p.stock < 10 ? `(剩${p.stock})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleAddProductToEdit}
                    disabled={!selectedProductId}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-colors"
                  >
                    加入清單
                  </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto border-2 border-gray-200 rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0 z-10">
                      <tr>
                        <th className="p-4">商品名稱</th>
                        <th className="p-4 w-28">單價</th>
                        <th className="p-4 w-32">數量</th>
                        <th className="p-4 w-24 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentEditItems.map((item, idx) => (
                        <tr key={idx} className={activeInput === `edit-${idx}-price` ? 'bg-blue-50' : ''}>
                          <td className="p-4 font-bold text-xl">{item.name}</td>
                          <td className="p-4">
                            <input 
                              type="number" 
                              value={item.price ?? ''} 
                              inputMode={useNativeKeyboard ? 'numeric' : 'none'}
                              onFocus={() => setActiveInput(`edit-${idx}-price`)}
                              onChange={(e) => handleEditItemChange(idx, 'price', parseInt(e.target.value))}
                              className={`w-24 p-2 border-2 rounded-lg font-bold text-center text-xl focus:outline-none 
                                ${activeInput === `edit-${idx}-price` ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditItemChange(idx, 'qty', item.qty - 1)} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><Minus size={20}/></button>
                              <span className="font-bold text-xl w-8 text-center">{item.qty}</span>
                              <button onClick={() => handleEditItemChange(idx, 'qty', item.qty + 1)} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><Plus size={20}/></button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleRemoveEditItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={24}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end items-center gap-4 text-2xl font-black text-gray-800 bg-gray-50 p-4 rounded-xl">
                  <span>修正後總金額:</span>
                  <span className="text-blue-600">${editTotal}</span>
                </div>

                {/* 付款資訊區塊 */}
                <div className="space-y-6 mt-6 pt-6 border-t-2 border-orange-200">
                  <h4 className="text-xl font-black text-orange-700 mb-4 flex items-center gap-2">
                    <Calculator size={24} /> 付款資訊
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 修正後總金額顯示 */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                      <label className="block text-sm font-bold text-orange-700 mb-2">修正後總金額</label>
                      <div className="text-3xl font-black text-orange-800">${editTotal}</div>
                    </div>

                    {/* 實收金額輸入 */}
                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-2">實收金額</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-3 text-gray-400 text-xl font-bold">$</span>
                          <input
                            type="number"
                            value={editReceivedAmount}
                            inputMode={useNativeKeyboard ? 'numeric' : 'none'}
                            onFocus={() => setActiveInput('edit-received')}
                            onChange={(e) => setEditReceivedAmount(e.target.value)}
                            className={`w-full pl-8 pr-4 py-3 text-2xl font-black border-2 rounded-xl focus:outline-none transition-all text-gray-900
                              ${activeInput === 'edit-received' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-orange-300'}`}
                            placeholder={editTotal}
                          />
                        </div>
                        <button
                          onClick={() => setUseNativeKeyboard(!useNativeKeyboard)}
                          className={`px-3 rounded-xl border-2 transition-colors ${useNativeKeyboard ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                        >
                          <Keyboard size={20} />
                        </button>
                      </div>

                      {/* 快速金額按鈕 */}
                      <div className="flex gap-2 mt-2">
                        {[100, 500, 1000].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setEditReceivedAmount(amt.toString())}
                            className="flex-1 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-bold transition-colors border border-gray-300"
                          >
                            ${amt}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditReceivedAmount(editTotal.toString())}
                          className="flex-1 py-2 text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg font-bold transition-colors border border-orange-300"
                        >
                          剛好
                        </button>
                      </div>
                    </div>

                    {/* 找零顯示 */}
                    <div>
                      <label className="block text-sm font-bold text-orange-700 mb-2">找零金額</label>
                      <div className={`p-4 rounded-xl border-2 text-center transition-colors ${editChangeAmount < 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-900'}`}>
                        <div className="text-2xl font-black">
                          {editChangeAmount < 0 ? '不足' : `$${editChangeAmount}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === 'payment' && paymentInfo && (
              <div className="space-y-6 mb-2">
                <div className="text-center p-6 bg-gray-100 rounded-2xl border-2 border-gray-200">
                  <div className="text-xl font-bold text-gray-600 mb-2">應收金額</div>
                  <div className="text-6xl font-black text-gray-900">${paymentInfo.total}</div>
                </div>
                
                <div>
                  <label className="block text-xl font-bold text-gray-800 mb-3">實收金額</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-5 top-4 text-gray-400 text-3xl font-bold">$</span>
                        <input 
                        type="number" 
                        value={receivedAmount}
                        inputMode={useNativeKeyboard ? 'numeric' : 'none'}
                        onFocus={() => setActiveInput('received')}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className={`w-full pl-10 pr-6 py-4 text-4xl font-black border-4 rounded-2xl focus:outline-none transition-all text-gray-900
                            ${activeInput === 'received' ? 'border-emerald-600 ring-4 ring-emerald-100' : 'border-emerald-200'}`}
                        placeholder={paymentInfo.total}
                        autoFocus
                        />
                    </div>
                    <div className="flex gap-3 mt-4">
                    {[100, 500, 1000].map(amt => (
                      <button key={amt} onClick={() => setReceivedAmount(amt.toString())} className="flex-1 py-4 text-xl bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-800 font-bold transition-colors border-2 border-gray-300">${amt}</button>
                    ))}
                    <button onClick={() => setReceivedAmount(paymentInfo.total.toString())} className="flex-1 py-4 text-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl font-bold transition-colors border-2 border-emerald-300">剛好</button>
                  </div>
                    <button
                        onClick={() => setUseNativeKeyboard(!useNativeKeyboard)}
                        className={`px-4 rounded-2xl border-4 transition-colors ${useNativeKeyboard ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
                        title="切換虛擬鍵盤"
                    >
                        <Keyboard size={32} />
                    </button>
                  </div>
                  
                </div>

                <div className={`flex justify-between items-center p-6 rounded-2xl border-2 transition-colors ${changeAmount < 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                  <span className="text-2xl font-bold">找零</span>
                  <span className="text-5xl font-black">{changeAmount < 0 ? '不足' : `$${changeAmount}`}</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 justify-end mt-8 pt-6 border-t-2 border-gray-100">
              {onCancel && <button onClick={onCancel} className="px-8 py-4 rounded-xl text-xl text-gray-600 hover:bg-gray-200 font-bold transition-colors bg-gray-100 border-2 border-gray-200">取消</button>}
              {type !== 'export-menu' && (
                <button 
                  onClick={handleConfirm}
                  disabled={type === 'payment' && changeAmount < 0}
                  className={`px-10 py-4 rounded-xl text-white text-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center gap-3
                    ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 
                      type === 'payment' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed' : 
                      type === 'edit-transaction' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' :
                      'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                >
                  {type === 'payment' ? <><CheckCircle size={32}/> 確認結帳</> : '確定'}
                </button>
              )}
            </div>
          </div>

          {showNumpad && (
            <div className="w-[300px] p-6 bg-gray-50 border-l-2 border-gray-200 flex flex-col justify-center">
              <div className="mb-4 text-center text-gray-500 font-bold">
                數字鍵盤
              </div>
              <Numpad 
                onInput={handleNumpadInput} 
                onDelete={handleNumpadDelete} 
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 主程式元件 ---
export default function App() {
  const [currentView, setCurrentView] = useState('pos');
  
  // STATE: 讀取 LocalStorage 或使用預設值
  const [products, setProducts] = useState(null); // null 表示未載入，防止競爭條件
  const [transactions, setTransactions] = useState(null); // null 表示未載入，防止競爭條件
  const [settings, setSettings] = useState(() => getLocalStorageItem(STORAGE_KEYS.SETTINGS, { barcodeFormat: 'CODE39' }));
  const [importedSnapshot, setImportedSnapshot] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(() => getLocalStorageItem(STORAGE_KEYS.IS_DEMO_MODE, false));
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 新增：資料載入狀態管理

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSound, setLastSound] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  // 編輯訂單時的付款狀態
  const [editReceivedAmount, setEditReceivedAmount] = useState('');
  const barcodeInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // 🔐 安全計算動態分類
  const dynamicCategories = useMemo(() => {
    try {
      // 類型安全檢查 - 處理 null 狀態（載入中）
      if (!products || !Array.isArray(products) || products.length === 0) {
        return ["全部"];
      }

      // 安全提取分類，過濾無效值
      const validCategories = products
        .map(p => {
          // 確保產品物件存在且有分類
          if (!p || typeof p !== 'object' || !p.category || typeof p.category !== 'string') {
            return null;
          }
          // 清理分類名稱
          return p.category.trim();
        })
        .filter(Boolean); // 移除空值

      // 建立唯一分類集合
      const cats = new Set(validCategories);

      // 限制分類數量防止 UI 過載
      const categoriesArray = Array.from(cats);
      if (categoriesArray.length > 20) {
        console.warn('分類數量過多，可能影響效能:', categoriesArray.length);
      }

      return ["全部", ...categoriesArray.slice(0, 20)]; // 最多20個分類
    } catch (error) {
      console.error('計算動態分類時發生錯誤:', error);
      return ["全部"]; // 安全備用值
    }
  }, [products]);

  const currentFormat = BARCODE_FORMATS.find(f => f.id === settings.barcodeFormat) || BARCODE_FORMATS[0];

  // --- Helper function to load data based on demo mode ---
  const loadData = useCallback((demoMode) => {
    console.log('🔄 開始載入資料，模式:', demoMode ? 'Demo' : '正常');
    setIsDataLoaded(false); // 開始載入，停止自動存檔防止競爭條件

    if (demoMode) {
      const demoProducts = getLocalStorageItem(STORAGE_KEYS.PRODUCTS_DEMO, DEMO_PRODUCTS);
      setProducts(demoProducts !== null && demoProducts.length > 0 ? demoProducts : DEMO_PRODUCTS);

      const demoTransactions = getLocalStorageItem(STORAGE_KEYS.TRANSACTIONS_DEMO, DEMO_TRANSACTIONS);
      setTransactions(demoTransactions !== null && demoTransactions.length > 0 ? demoTransactions : DEMO_TRANSACTIONS);

      setImportedSnapshot(getLocalStorageItem(STORAGE_KEYS.IMPORTED_SNAPSHOT_DEMO, DEMO_IMPORTED_SNAPSHOT));
    } else {
      // For real mode, if nothing is saved in localStorage, default to INITIAL_PRODUCTS
      // Otherwise, load what's saved.
      const savedProducts = getLocalStorageItem(STORAGE_KEYS.PRODUCTS, null); // Use null as default for checking existence
      setProducts(savedProducts !== null && savedProducts.length > 0 ? savedProducts : INITIAL_PRODUCTS);

      setTransactions(getLocalStorageItem(STORAGE_KEYS.TRANSACTIONS, []));
      setImportedSnapshot(getLocalStorageItem(STORAGE_KEYS.IMPORTED_SNAPSHOT, []));
    }

    // 載入完成，重新啟用自動存檔
    setTimeout(() => {
      setIsDataLoaded(true);
      console.log('✅ 資料載入完成，自動存檔已啟用');
    }, 100); // 短暫延遲確保所有狀態更新完成
  }, []); // dependencies: none because we use getLocalStorageItem and specific constants

  // --- 庫存自動化管理函數 ---
  const calculateStockChanges = useCallback((originalItems, newItems) => {
    const stockChanges = new Map();

    // 計算原訂單的庫存回補
    originalItems.forEach(item => {
      if (!item.isCustom) {
        stockChanges.set(item.id, (stockChanges.get(item.id) || 0) + item.qty);
      }
    });

    // 計算新訂單的庫存扣減
    newItems.forEach(item => {
      if (!item.isCustom) {
        stockChanges.set(item.id, (stockChanges.get(item.id) || 0) - item.qty);
      }
    });

    return stockChanges;
  }, []);

  const applyStockChanges = useCallback((stockChanges) => {
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const change = stockChanges.get(product.id);
        if (change !== undefined) {
          return {
            ...product,
            stock: Math.max(0, product.stock + change)
          };
        }
        return product;
      })
    );
  }, []);

  // EFFECT: Initial data load and when demo mode changes
  useEffect(() => {
    loadData(isDemoMode);
  }, [isDemoMode, loadData]); // Re-run when isDemoMode changes

  // EFFECT: 安全自動存檔 - Products
  useEffect(() => {
    // 🔐 只在資料載入完成且有有效資料時才存檔，防止競爭條件
    if (!isDataLoaded || !products) {
      console.log('⏸️ 跳過 products 存檔：載入狀態=', isDataLoaded, '資料狀態=', products ? '有資料' : 'null');
      return;
    }

    const key = isDemoMode ? STORAGE_KEYS.PRODUCTS_DEMO : STORAGE_KEYS.PRODUCTS;
    console.log('💾 正在存檔 products 到', key, '資料筆數:', products.length);
    setLocalStorageItem(key, products, (error) => {
      console.error('商品資料存檔失敗:', error);
      // 可選：通知用戶存檔失敗
    });
  }, [products, isDemoMode, isDataLoaded]);

  // EFFECT: 安全自動存檔 - Transactions
  useEffect(() => {
    // 🔐 只在資料載入完成且有有效資料時才存檔，防止競爭條件
    if (!isDataLoaded || !transactions) {
      console.log('⏸️ 跳過 transactions 存檔：載入狀態=', isDataLoaded, '資料狀態=', transactions ? '有資料' : 'null');
      return;
    }

    const key = isDemoMode ? STORAGE_KEYS.TRANSACTIONS_DEMO : STORAGE_KEYS.TRANSACTIONS;
    console.log('💾 正在存檔 transactions 到', key, '資料筆數:', transactions.length);
    setLocalStorageItem(key, transactions, (error) => {
      console.error('交易記錄存檔失敗:', error);
    });
  }, [transactions, isDemoMode, isDataLoaded]);

  useEffect(() => {
    setLocalStorageItem(STORAGE_KEYS.SETTINGS, settings, (error) => {
      console.error('設定存檔失敗:', error);
    });
  }, [settings]);

  useEffect(() => {
    const key = isDemoMode ? STORAGE_KEYS.IMPORTED_SNAPSHOT_DEMO : STORAGE_KEYS.IMPORTED_SNAPSHOT;
    setLocalStorageItem(key, importedSnapshot, (error) => {
      console.error('匯入快照存檔失敗:', error);
    });
  }, [importedSnapshot, isDemoMode]);
  useEffect(() => {
    setLocalStorageItem(STORAGE_KEYS.IS_DEMO_MODE, isDemoMode, (error) => {
      console.error('Demo模式設定存檔失敗:', error);
    });
  }, [isDemoMode]);

  // --- 計算邏輯 ---
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  const todayTotal = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return 0; // 如果 transactions 為 null（載入中），返回 0
    }

    return transactions.reduce((acc, t) => {
      // 🔧 使用數值比較方式，避免字串格式化問題
      if (DateUtils.isToday(t.time)) {
        return acc + t.total;
      }
      return acc;
    }, 0);
  }, [transactions]);

  // 銷售紀錄篩選邏輯 - 🔧 園遊會單日模式：始終只顯示今日資料
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    const filtered = transactions.filter(t => {
      // 🔧 使用數值比較方式，避免字串格式化問題
      return DateUtils.isToday(t.time);
    });

    // 添加調試信息 (可選 - 生產環境可移除)
    if (process.env.NODE_ENV === 'development') {
      const debugInfo = {
        todayString: DateUtils.getTodayString(),
        totalTransactions: transactions.length,
        todayTransactions: filtered.length,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        transactionDetails: transactions.slice(0, 3).map(t => ({
          originalTime: t.time,
          parsedDate: DateUtils.parseTime(t.time),
          isToday: DateUtils.isToday(t.time),
          dateComponents: DateUtils.getDateComponents(t.time)
        }))
      };
      console.log('🔧 Debug - 園遊會單日模式篩選:', debugInfo);
    }

    return filtered;
  }, [transactions]);

  // 營收計算 - 🔧 園遊會單日模式：始終顯示今日營收
  const displayedRevenue = todayTotal;

  const playSound = (type) => {
    setLastSound(type);
    playSystemSound(type);
    setTimeout(() => setLastSound(null), 1000);
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  // 🔔 庫存警告專用關閉函數（不會離開修改訂單頁面）
  const closeStockWarningModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    // 注意：不重新聚焦條碼輸入欄，保持在修改訂單頁面
  };

  // 🔔 庫存不足警告處理函數
  const handleStockWarning = (warningInfo) => {
    const { productName, requestedQty, availableStock, adjustedQty, isAddingNew } = warningInfo;

    let message = '';
    if (isAddingNew) {
      message = `無法新增「${productName}」到訂單中。\n\n目前可用庫存：${availableStock} 個\n您嘗試新增：${requestedQty} 個\n\n請先調整其他商品數量或增加庫存。`;
    } else if (availableStock <= 0) {
      message = `「${productName}」庫存不足！\n\n目前可用庫存：${availableStock} 個\n您嘗試設定：${requestedQty} 個\n已自動調整為：${adjustedQty} 個\n\n提醒：修改訂單時，原訂單數量會暫時釋放供重新分配。`;
    } else {
      message = `「${productName}」庫存數量不足！\n\n目前可用庫存：${availableStock} 個\n您嘗試設定：${requestedQty} 個\n已自動調整為：${adjustedQty} 個\n\n提醒：修改訂單時，原訂單數量會暫時釋放供重新分配。`;
    }

    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: '庫存數量限制',
      message: message,
      onConfirm: closeStockWarningModal, // 使用專門的關閉函數
      autoCloseDelay: 4000 // 4秒後自動關閉
    });
  };

  // 🔧 重置 Demo 資料函數
  const handleResetDemoData = () => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: '重置 Demo 資料',
      message: '這將會清空所有 Demo 模式的變更，恢復為原始的示範資料。\n\n包含：\n• 恢復原始交易紀錄\n• 恢復原始商品庫存\n• 清除所有修改歷史\n\n確定要執行嗎？',
      onCancel: closeModal,
      onConfirm: () => {
        // 清除 Demo 模式的 localStorage 資料
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS_DEMO);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS_DEMO);
        localStorage.removeItem(STORAGE_KEYS.IMPORTED_SNAPSHOT_DEMO);

        // 重新載入 Demo 資料
        if (isDemoMode) {
          console.log('🔄 重置 Demo 資料並重新載入');
          setIsDataLoaded(false);
          loadData(true); // 重新載入 Demo 資料
        }

        playSound('cash');
        closeModal();
      }
    });
  };

  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      setModalConfig({
        isOpen: true,
        type: 'warning', // A new type for warning
        title: '退出 Demo 模式',
        message: '您確定要退出 Demo 模式嗎？應用程式將重新載入真實資料。Demo 模式中的所有變更將不會保留在真實資料中。',
        onCancel: closeModal,
        onConfirm: () => {
          console.log('🔄 切換至正常模式');
          setIsDataLoaded(false); // 🔐 暫停自動存檔防止競爭條件
          setIsDemoMode(false);   // 觸發模式切換和資料重新載入
          closeModal();
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'info',
        title: '進入 Demo 模式',
        message: '您確定要進入 Demo 模式嗎？所有操作將使用模擬資料，且變更不會影響真實資料。',
        onCancel: closeModal,
        onConfirm: () => {
          console.log('🔄 切換至 Demo 模式');
          setIsDataLoaded(false); // 🔐 暫停自動存檔防止競爭條件
          setIsDemoMode(true);    // 觸發模式切換和資料重新載入
          closeModal();
        }
      });
    }
  };

  // ... (handleResetSystem, handleRestoreStock, handleDownloadTemplate, handleImportCSV same as before) ...
  const handleResetSystem = () => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: '重置所有資料',
      message: '這將會清空「所有」銷售紀錄並將庫存恢復為預設值。\n通常在第二天活動開始前執行。\n確定要執行嗎？',
      onCancel: closeModal,
      onConfirm: () => {
        setProducts(INITIAL_PRODUCTS);
        setImportedSnapshot([]);
        setTransactions([]);
        setCart([]);
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.IMPORTED_SNAPSHOT);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        playSound('clear');
        closeModal();
      }
    });
  };

  const handleRestoreStock = () => {
    if (importedSnapshot.length === 0) {
      setModalConfig({
        isOpen: true,
        type: 'info',
        title: '無還原點',
        message: '尚未匯入過 CSV，無法還原庫存。',
        onConfirm: closeModal
      });
      return;
    }
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: '恢復每日庫存', 
      message: `確定要將所有商品庫存重置為「每日預設值」嗎？\n(即回到最後一次匯入 CSV 時的數量)\n\n注意：目前的庫存變更將會被覆蓋。`,
      onCancel: closeModal,
      onConfirm: () => {
        setProducts(JSON.parse(JSON.stringify(importedSnapshot))); 
        playSound('cash');
        closeModal();
      }
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent = "\uFEFF商品名稱,價格,分類,條碼,庫存\n範例商品,100,熱食,123456,50";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 🔐 安全檢查 1: 檔案大小限制 (1MB)
    const MAX_FILE_SIZE = 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      playSound('error');
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: '檔案過大',
        message: `檔案大小超過限制 (${(file.size / 1024 / 1024).toFixed(2)}MB > 1MB)\n請使用小於 1MB 的 CSV 檔案。`,
        onConfirm: closeModal
      });
      event.target.value = '';
      return;
    }

    // 🔐 安全檢查 2: 檔案類型驗證
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      playSound('error');
      setModalConfig({
        isOpen: true,
        type: 'danger',
        title: '檔案格式錯誤',
        message: '請選擇 CSV 格式的檔案 (.csv)',
        onConfirm: closeModal
      });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        let text = '';
        const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
        try {
          text = utf8Decoder.decode(buffer);
        } catch (error) {
          console.log("UTF-8 decoding failed, trying Big5...");
          const big5Decoder = new TextDecoder('big5');
          text = big5Decoder.decode(buffer);
        }
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        const rows = text.split(/\r\n|\n/).filter(row => row.trim() !== '');
        const dataRows = rows.slice(1);
        if (dataRows.length === 0) throw new Error("CSV 檔案內容為空");

        // 🔐 安全檢查 3: 限制匯入數量
        const MAX_PRODUCTS = 1000;
        if (dataRows.length > MAX_PRODUCTS) {
          throw new Error(`商品數量過多 (${dataRows.length} > ${MAX_PRODUCTS})，請分批匯入`);
        }

        // 🔐 資料驗證和清理函數
        const sanitizeString = (str) => {
          if (!str || typeof str !== 'string') return '';
          // 移除潛在的 HTML 標籤和特殊字符
          return str.trim().replace(/<[^>]*>?/gm, '').substring(0, 100);
        };

        const validateAndParseNumber = (value, fieldName, min = 0, max = 999999) => {
          const num = parseInt(value);
          if (isNaN(num) || num < min || num > max) {
            throw new Error(`${fieldName} 數值無效: ${value} (應在 ${min}-${max} 之間)`);
          }
          return num;
        };

        const validationErrors = [];
        const newProducts = dataRows.map((row, index) => {
          try {
            const cols = row.split(',');

            // 驗證欄位數量
            if (cols.length < 5) {
              throw new Error(`第 ${index + 2} 行欄位不足 (需要5欄，實際${cols.length}欄)`);
            }

            // 清理和驗證資料
            const name = sanitizeString(cols[0]) || `未命名商品 ${index + 1}`;
            const price = validateAndParseNumber(cols[1], `第 ${index + 2} 行價格`, 0, 99999);
            const category = sanitizeString(cols[2]) || "其他";
            const barcode = sanitizeString(cols[3]);
            const stock = validateAndParseNumber(cols[4], `第 ${index + 2} 行庫存`, 0, 99999);

            // 驗證商品名稱長度
            if (name.length < 1 || name.length > 50) {
              throw new Error(`第 ${index + 2} 行商品名稱長度無效 (1-50字符)`);
            }

            return {
              id: Date.now() + index,
              name,
              price,
              category,
              barcode,
              stock,
              isCustom: false
            };
          } catch (error) {
            validationErrors.push(error.message);
            return null;
          }
        }).filter(product => product !== null);

        // 檢查驗證錯誤
        if (validationErrors.length > 0) {
          const errorMessage = validationErrors.slice(0, 5).join('\n') +
            (validationErrors.length > 5 ? `\n...及其他 ${validationErrors.length - 5} 個錯誤` : '');
          throw new Error(`資料驗證失敗:\n${errorMessage}`);
        }

        if (newProducts.length === 0) {
          throw new Error("無有效的商品資料可匯入");
        }
        setModalConfig({
          isOpen: true,
          type: 'danger',
          title: '確認匯入商品',
          message: `即將匯入 ${newProducts.length} 筆商品資料。\n注意：這將會「完全覆蓋」目前的商品清單與庫存。\n確定要繼續嗎？`,
          onCancel: () => { closeModal(); event.target.value = ''; },
          onConfirm: () => {
            setProducts(newProducts);
            setImportedSnapshot(newProducts);
            setSelectedCategory("全部"); 
            playSound('cash');
            closeModal();
            event.target.value = '';
          }
        });
      } catch (error) {
        console.error(error);
        playSound('error');
        setModalConfig({ isOpen: true, type: 'info', title: '匯入失敗', message: '無法解析 CSV 檔案，請確認格式是否正確。\n建議使用 UTF-8 或 Big5 編碼格式。', onConfirm: closeModal });
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // ... (addToCart, updateQty, removeFromCart, handleCustomProduct, handleEditItem, clearCart, handleRestock, handleCheckout, handleEditTransaction, voidTransaction, handleBarcodeInput, handleBarcodeSubmit same as before) ...
  const addToCart = (product, qty = 1) => {
    const currentStock = product.stock;
    const existingInCart = cart.find(i => i.id === product.id);
    const qtyInCart = existingInCart ? existingInCart.qty : 0;
    const finalQty = qty; 
    if (product.isCustom || (currentStock - qtyInCart - finalQty >= 0)) {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + finalQty } : item);
        }
        return [...prev, { ...product, qty: finalQty }];
      });
      playSound('beep');
    } else {
      playSound('error');
      setModalConfig({ isOpen: true, type: 'info', title: '庫存不足', message: `「${product.name}」剩餘庫存為 ${currentStock}，無法再加入 ${finalQty} 個。`, onConfirm: closeModal });
    }
  };

  const updateQty = (id, delta) => {
    if (delta > 0) {
      const item = cart.find(i => i.id === id);
      const product = products.find(p => p.id === id);
      if (item && product && !product.isCustom) {
         if (product.stock <= item.qty) { playSound('error'); return; }
      }
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const handleCustomProduct = () => {
    setModalConfig({
      isOpen: true, type: 'input', title: '新增自訂商品', message: '請輸入商品名稱與金額',
      inputs: [
        { name: 'name', label: '商品名稱', defaultValue: '其他項目', autoFocus: true },
        { name: 'price', label: '金額', type: 'number', defaultValue: '' }
      ],
      onCancel: closeModal,
      onConfirm: (values) => {
        if (!values.name || !values.price) return;
        addToCart({ id: `custom-${Date.now()}`, name: values.name, price: parseInt(values.price), category: "自訂", isCustom: true, stock: 9999 });
        closeModal();
      }
    });
  };

  const handleEditItem = (item) => {
    setModalConfig({
      isOpen: true, type: 'input', title: '修改商品價格', message: '注意：您僅能修改此商品的單價 (清倉改價用)，名稱不可變更。',
      inputs: [
        { name: 'name', label: '商品名稱 (不可修改)', defaultValue: item.name, readOnly: true },
        { name: 'price', label: '單價', type: 'number', defaultValue: item.price, autoFocus: true }
      ],
      onCancel: closeModal,
      onConfirm: (values) => {
        if (!values.price) return;
        setCart(prev => prev.map(cartItem => cartItem.id === item.id ? { ...cartItem, price: parseInt(values.price) } : cartItem));
        closeModal();
      }
    });
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setModalConfig({
        isOpen: true, type: 'danger', title: '清空購物車', message: '確定要移除購物車內所有商品嗎？', onCancel: closeModal,
        onConfirm: () => { setCart([]); playSound('clear'); closeModal(); }
      });
    }
  };

  const handleRestock = (product) => {
    setModalConfig({
      isOpen: true, type: 'input', title: `調整庫存: ${product.name}`, message: `目前庫存: ${product.stock}。請輸入新的庫存數量。`,
      inputs: [
        { name: 'stock', label: '新庫存數量', type: 'number', defaultValue: product.stock.toString(), autoFocus: true }
      ],
      onCancel: closeModal,
      onConfirm: (values) => {
        if (values.stock === '') return;
        const newStock = parseInt(values.stock);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
        closeModal();
      }
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) { playSound('error'); return; }
    setModalConfig({
      isOpen: true, type: 'payment', title: '結帳確認', paymentInfo: { total: cartTotal }, onCancel: closeModal,
      onConfirm: (paymentResult) => {
        try {
          // 🔐 交易完整性檢查：預先驗證庫存
          const stockValidationErrors = [];
          cart.forEach(cartItem => {
            if (!cartItem.isCustom) {
              const product = products.find(p => p.id === cartItem.id);
              if (!product || product.stock < cartItem.qty) {
                stockValidationErrors.push(`${cartItem.name} 庫存不足 (需要:${cartItem.qty}, 可用:${product?.stock || 0})`);
              }
            }
          });

          if (stockValidationErrors.length > 0) {
            throw new Error(`庫存驗證失敗:\n${stockValidationErrors.join('\n')}`);
          }

          // 🔐 建立交易記錄 (使用更安全的 ID 生成)
          const transactionId = Date.now() + Math.random().toString(36).substr(2, 9);
          const newTransaction = {
            id: transactionId,
            time: new Date().toLocaleString(),
            items: [...cart],
            total: cartTotal,
            received: paymentResult.received,
            change: paymentResult.change,
            status: 'completed'
          };

          // 🔐 原子性操作：先備份當前狀態
          const currentProducts = [...products];
          const currentTransactions = [...transactions];

          try {
            // 第一步：更新交易記錄
            setTransactions(prev => [newTransaction, ...prev]);

            // 第二步：更新庫存
            setProducts(prevProducts => prevProducts.map(product => {
              const cartItem = cart.find(c => c.id === product.id);
              if (cartItem && !product.isCustom) {
                const newStock = Math.max(0, product.stock - cartItem.qty);
                return { ...product, stock: newStock };
              }
              return product;
            }));

            // 成功完成所有更新
            setCart([]);
            playSound('cash');
            closeModal();
          } catch (updateError) {
            console.error('更新狀態失敗，進行回滾:', updateError);

            // 回滾到原始狀態
            setProducts(currentProducts);
            setTransactions(currentTransactions);

            throw new Error('結帳處理失敗，已回滾所有變更');
          }

        } catch (error) {
          console.error('結帳失敗:', error);
          playSound('error');
          setModalConfig({
            isOpen: true,
            type: 'danger',
            title: '結帳失敗',
            message: `結帳處理時發生錯誤：\n${error.message}\n\n請重新嘗試或聯繫技術支援。`,
            onConfirm: closeModal
          });
        }
      }
    });
  };

  const handleEditTransaction = (transaction) => {
    setModalConfig({
      isOpen: true,
      type: 'edit-transaction',
      title: '修改訂單內容',
      message: '您可以修改此筆訂單的商品內容、數量與付款資訊。',
      editItems: transaction.items,
      originalTransaction: transaction,
      allProducts: products,
      onCancel: closeModal,
      onConfirm: (newItems, paymentInfo) => {
        if (newItems.length === 0) {
          if(confirm("商品已全部清空，是否直接刪除此筆訂單？")) {
            voidTransactionWithStockRestore(transaction.id, transaction.items);
          }
          return;
        }

        // 計算並應用庫存變更
        const stockChanges = calculateStockChanges(transaction.items, newItems);
        applyStockChanges(stockChanges);

        // 計算新總金額
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

        // 處理付款資訊 - 如果有新的付款資訊則使用，否則保留原有
        const updatedTransaction = {
          ...transaction,
          items: newItems,
          total: newTotal,
          received: paymentInfo?.received ?? transaction.received,
          change: paymentInfo?.change ?? transaction.change,
          isModified: true,
          lastModified: new Date().toLocaleString()
        };

        setTransactions(prev =>
          prev.map(t => t.id === transaction.id ? updatedTransaction : t)
        );

        playSound('cash');
        closeModal();
      }
    });
  };

  // 帶庫存回補的刪除訂單函數
  const voidTransactionWithStockRestore = useCallback((id, items) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: '刪除訂單',
      message: '確定要刪除這筆紀錄嗎？系統將自動回補庫存並扣除當日營收。此操作無法復原。',
      onCancel: closeModal,
      onConfirm: () => {
        // 回補庫存
        const stockChanges = new Map();
        items.forEach(item => {
          if (!item.isCustom) {
            stockChanges.set(item.id, (stockChanges.get(item.id) || 0) + item.qty);
          }
        });
        applyStockChanges(stockChanges);

        // 刪除交易
        setTransactions(prev => prev.filter(t => t.id !== id));
        playSound('clear');
        closeModal();
      }
    });
  }, [applyStockChanges]);

  const voidTransaction = (id) => {
    setModalConfig({
      isOpen: true, type: 'danger', title: '刪除訂單', message: '確定要刪除這筆紀錄嗎？這將會扣除當日營收且無法復原。(注意：庫存不會自動補回，需手動調整)',
      onCancel: closeModal,
      onConfirm: () => { setTransactions(prev => prev.filter(t => t.id !== id)); playSound('clear'); closeModal(); }
    });
  };

  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    const normalizedValue = value.replace(/[\uff01-\uff5e]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xfee0); });
    setBarcodeInput(normalizedValue);
    const matchedProduct = products.find(p => p.barcode === normalizedValue.trim());
    if (matchedProduct) {
      const now = Date.now();
      if (now - lastScanTimeRef.current < 500) { console.log("Scan ignored (debounce)"); setBarcodeInput(""); return; }
      lastScanTimeRef.current = now;
      addToCart(matchedProduct); setBarcodeInput("");
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const product = products.find(p => p.barcode === code);
    if (product) {
       const now = Date.now();
       if (now - lastScanTimeRef.current > 500) { lastScanTimeRef.current = now; addToCart(product); }
       setBarcodeInput("");
    } else {
       playSound('error');
       setModalConfig({ isOpen: true, type: 'danger', title: '查無此商品', message: `系統找不到條碼為「${code}」的商品。\n視窗將於 2.5 秒後自動關閉，請準備重新掃描。`, onConfirm: closeModal, autoCloseDelay: 2500 });
       setBarcodeInput("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalConfig.isOpen) {
        if (e.code === 'Escape' && modalConfig.onCancel) modalConfig.onCancel();
        return;
      }
      if (document.activeElement.tagName === 'INPUT') return;
      switch(e.code) {
        case 'Space': case 'Enter': e.preventDefault(); handleCheckout(); break;
        case 'Escape': e.preventDefault(); clearCart(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, modalConfig]);

  // --- 核心匯出邏輯 (Data Processing) ---
  const exportData = (dataType, scope) => {
    // 🔧 詳細調試匯出邏輯
    console.group('🔍 Export Data Debug');
    console.log('Scope:', scope);
    console.log('Total transactions:', transactions.length);

    // 1. 篩選資料範圍 - 使用數值比較方式避免字串格式化問題
    const dataToExport = scope === 'today'
      ? transactions.filter(t => {
          const isToday = DateUtils.isToday(t.time);
          console.log(`Transaction ${t.id}: time="${t.time}", isToday=${isToday}, components=`, DateUtils.getDateComponents(t.time));
          return isToday;
        })
      : transactions;

    console.log('Filtered transactions:', dataToExport.length);
    console.log('Today components:', DateUtils.getDateComponents(new Date()));
    console.groupEnd();

    if (dataToExport.length === 0) {
      setModalConfig({ 
        isOpen: true, 
        type: 'info', 
        title: '無資料', 
        message: `查無${scope === 'today' ? '今日' : '歷史'}銷售紀錄，無法匯出。`, 
        onConfirm: closeModal 
      });
      return;
    }

    const scopeName = scope === 'today' ? `Today_${new Date().toISOString().slice(0,10)}` : 'All_History';
    const escapeCSV = (str) => `"${String(str).replace(/"/g, '""')}"`;
    let csvContent = "\uFEFF";
    let fileName = "";

    // 2. 根據類型產生 CSV 內容
    if (dataType === 'orders') {
      // 訂單明細
      const headers = ["交易ID", "時間", "商品詳情", "總金額", "實收", "找零", "狀態"];
      const rows = dataToExport.map(t => [
        escapeCSV(t.id),
        escapeCSV(t.time),
        escapeCSV(t.items.map(i => `${i.name} x${i.qty}`).join('; ')),
        t.total,
        t.received || '-',
        t.change || '-',
        t.status
      ]);
      csvContent += [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      fileName = `POS_Orders_${scopeName}.csv`;
    } else {
      // 商品統計
      // 1. 先從銷售紀錄中計算出有賣出的商品的統計數據
      const salesStats = {};
      dataToExport.forEach(t => {
        t.items.forEach(item => {
          if (!salesStats[item.name]) {
            salesStats[item.name] = { qty: 0, revenue: 0 };
          }
          salesStats[item.name].qty += item.qty;
          salesStats[item.name].revenue += (item.price * item.qty);
        });
      });

      // 2. 以完整的商品清單 (products) 為基礎來建立每一列資料
      const headers = ["商品名稱", "分類", "銷售數量", "銷售總額", "目前庫存"];
      const rows = products.map(product => {
        const stats = salesStats[product.name] || { qty: 0, revenue: 0 };
        return [
          escapeCSV(product.name),
          escapeCSV(product.category),
          stats.qty,
          stats.revenue,
          product.stock
        ];
      });

      csvContent += [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      fileName = `POS_Products_${scopeName}.csv`;
    }

    // 3. 下載檔案
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playSound('cash');
    closeModal(); // 關閉選單
  };

  // 開啟匯出選單
  const handleOpenExportMenu = () => {
    setModalConfig({
      isOpen: true,
      type: 'export-menu',
      title: '選擇匯出報表',
      message: '請選擇您要匯出的資料範圍與類型。',
      onCancel: closeModal,
      onExportAction: exportData // 傳遞匯出函式
    });
  };

  const filteredProducts = products ? products.filter(p => {
    const matchCat = selectedCategory === "全部" || p.category === selectedCategory;
    const matchSearch = p.name.includes(searchQuery) || p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  }) : []; // 如果 products 為 null（載入中），返回空陣列

  const getCategoryColor = (cat) => {
    switch(cat) {
      case "熱食": return "bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-900";
      case "飲料": return "bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-900";
      case "點心": return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-900";
      case "遊戲": return "bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-900";
      default: return "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-900";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden relative text-lg">
      <Modal
        {...modalConfig}
        editReceivedAmount={editReceivedAmount}
        setEditReceivedAmount={setEditReceivedAmount}
        playSound={playSound}
        onStockWarning={handleStockWarning}
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportCSV} 
        accept=".csv" 
        className="hidden" 
      />

      <header className="flex-none h-20 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-10">
        {isDemoMode && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-slate-900 text-center font-black text-xl py-1 z-50 animate-bounce">
            DEMO 模式已啟用 - 變更將不會永久保存
          </div>
        )}
        {/* Header Content */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><Monitor size={28} className="text-white" /></div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl tracking-wide">園遊會 POS <span className="bg-yellow-500 text-black px-2 rounded text-sm ml-2 font-bold">高齡友善版</span></h1>
            <span className="text-sm text-gray-400">大字體模式 v3.0</span>
          </div>
        </div>
        <nav className="flex bg-slate-800 rounded-xl p-1.5 gap-1">
          <button onClick={() => setCurrentView('pos')} className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-xl ${currentView === 'pos' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}><ShoppingCart size={24} /><span>收銀台</span></button>
          <button onClick={() => setCurrentView('inventory')} className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-xl ${currentView === 'inventory' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}><Box size={24} /><span>庫存管理</span></button>
          <button onClick={() => setCurrentView('history')} className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-xl ${currentView === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}><History size={24} /><span>銷售紀錄</span></button>
          <button onClick={() => setCurrentView('settings')} className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-bold text-xl ${currentView === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}><Settings size={24} /><span>設定</span></button>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-green-400"><Save size={14} /><span className="text-xs">自動存檔開啟</span></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* POS View */}
        {currentView === 'pos' && (
          <>
            <div className="flex-1 flex flex-col border-r-2 border-gray-200 bg-white">
              <div className="p-4 border-b-2 border-gray-200 bg-gray-100 flex gap-4 overflow-x-auto items-center">
                <div className="relative flex-none">
                  <Search className="absolute left-4 top-4 text-gray-500" size={24} />
                  <input type="text" placeholder="搜尋商品..." className="pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500 w-64 shadow-sm text-xl font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="h-10 w-0.5 bg-gray-300 mx-2"></div>
                <div className={`px-4 py-2 rounded-lg border-2 text-sm font-bold flex items-center gap-2 ${currentFormat.color}`}>
                  <ScanLine size={18} />
                  {currentFormat.name}
                </div>
                <div className="h-10 w-0.5 bg-gray-300 mx-2"></div>
                <div className="flex gap-3">
                  {dynamicCategories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl text-xl font-bold whitespace-nowrap transition-colors shadow-sm border-2 ${selectedCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-700 hover:bg-gray-200 border-gray-300'}`}>{cat}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                  <button onClick={handleCustomProduct} className="min-h-[160px] h-full flex flex-col items-center justify-center p-4 rounded-2xl border-4 border-dashed border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 group">
                    <Plus size={48} className="mb-2 opacity-50 group-hover:opacity-100" /><span className="font-black text-2xl">自訂金額</span>
                  </button>
                  {filteredProducts.map(product => {
                    const isSoldOut = product.stock <= 0;
                    return (
                    <button
                      key={product.id}
                      onClick={() => !isSoldOut && addToCart(product)}
                      disabled={isSoldOut}
                      className={`min-h-[160px] flex flex-col justify-between p-4 rounded-2xl border-b-8 transition-all shadow-md relative group
                        ${isSoldOut ? 'bg-gray-100 border-gray-200 text-gray-400/50 cursor-not-allowed' : `${getCategoryColor(product.category)} active:scale-95 hover:shadow-xl hover:-translate-y-1`}`}
                    >
                      {isSoldOut && <div className="absolute top-2 right-2 bg-red-600 text-white text-sm font-black px-3 py-1 rounded-full shadow-md z-10 animate-pulse">已售完</div>}
                      <div className="w-full flex justify-between items-start mb-2">
                        <span className={`text-lg font-black px-2 py-1 rounded-lg ${isSoldOut ? 'bg-gray-200 text-gray-400' : 'bg-white/60 text-gray-800'}`}>{product.category}</span>
                        {!isSoldOut && <span className={`text-lg font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-white/60 text-gray-700'}`}>剩餘 {product.stock}</span>}
                      </div>
                      <div className="text-center font-black text-3xl leading-tight mb-1 relative z-10 w-full truncate">{product.name}</div>
                      <div className="text-center font-black text-4xl opacity-90 mt-auto">${product.price}</div>
                    </button>
                  )})}
                </div>
              </div>
            </div>

            {/* Cart Panel */}
            <div className="w-full md:w-1/3 min-w-[320px] max-w-[450px] flex-none bg-white flex flex-col border-l-2 border-gray-300 shadow-2xl z-20">
              <div className="p-4 bg-slate-800 text-white">
                <form onSubmit={handleBarcodeSubmit} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-3.5 text-gray-400" size={24} />
                    <input ref={barcodeInputRef} type="text" value={barcodeInput} onChange={handleBarcodeInput} placeholder={`掃描條碼 (${currentFormat.name})`} className="w-full bg-slate-700 border-2 border-slate-600 rounded-xl pl-12 pr-4 py-3 text-xl text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500 focus:outline-none font-bold" autoFocus inputMode="none" />
                  </div>
                </form>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60"><ShoppingCart size={80} /><p className="text-2xl font-bold">購物車是空的</p><p className="text-lg">掃描商品或點擊左側按鈕</p></div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-xl shadow-md border-l-8 border-blue-500 flex items-center justify-between group animate-[fade-in_0.1s_ease-out]">
                      <div className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors rounded p-1" onClick={() => handleEditItem(item)} title="點擊修改單價">
                        <div className="font-black text-gray-900 text-2xl flex items-center gap-2 mb-1">{item.name}<Edit3 size={18} className="text-blue-400" /></div>
                        <div className="text-lg text-gray-500 font-bold">${item.price} x {item.qty}</div>
                      </div>
                      <div className="font-black text-3xl text-blue-700 w-24 text-right mr-4">${item.price * item.qty}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors shadow-sm active:scale-95"><Minus size={28} strokeWidth={3} /></button>
                        <button onClick={() => updateQty(item.id, 1)} className="w-12 h-12 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors shadow-sm active:scale-95"><Plus size={28} strokeWidth={3} /></button>
                        <button onClick={() => removeFromCart(item.id)} className="w-12 h-12 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-colors shadow-sm active:scale-95 ml-2"><Trash2 size={24} strokeWidth={2.5} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 bg-white border-t-2 border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-end mb-6"><span className="text-gray-500 font-bold text-2xl">總金額</span><span className="text-6xl font-black text-slate-900 tracking-tight">${cartTotal.toLocaleString()}</span></div>
                <div className="grid grid-cols-4 gap-4">
                   <button onClick={clearCart} className="col-span-1 py-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-lg flex flex-col items-center justify-center transition-colors"><Trash2 size={24} className="mb-1"/>清空</button>
                   <button onClick={handleCheckout} disabled={cart.length === 0} className="col-span-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-3xl shadow-xl active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-3"><CreditCard size={32} /> 結帳 (Space)</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Inventory View */}
        {currentView === 'inventory' && (
          <div className="flex-1 bg-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3"><Box className="text-blue-600" size={36}/>庫存管理</h2>
                <div className="flex gap-4">
                  <button onClick={handleRestoreStock} className="flex items-center gap-3 px-6 py-3 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-xl font-bold transition-colors border-2 border-orange-200 text-xl shadow-sm"><ArchiveRestore size={24} /> ↺ 恢復每日庫存</button>
                  <button onClick={handleDownloadTemplate} className="flex items-center gap-3 px-6 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition-colors border-2 border-gray-300 text-xl shadow-sm"><FileDown size={24} /> 下載範例 CSV</button>
                  <button onClick={triggerFileUpload} className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-colors border-2 border-blue-200 text-xl shadow-sm"><Upload size={24} /> 匯入商品 (CSV)</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                   <div key={p.id} className="p-6 border-2 border-gray-200 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all hover:border-blue-300 group cursor-pointer" onClick={() => handleRestock(p)}>
                     <div>
                       <div className="font-black text-2xl text-gray-800 mb-1">{p.name}</div>
                       <div className="text-lg text-gray-500 font-medium">條碼: {p.barcode || "無"}</div>
                     </div>
                     <div className="text-right">
                       <button className={`text-3xl font-black px-6 py-2 rounded-xl border-2 transition-colors flex items-center gap-3 shadow-inner ${p.stock < 10 ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-100 bg-blue-50 text-blue-600'}`}>
                         {p.stock} <Edit3 size={20} className="opacity-50 group-hover:opacity-100"/>
                       </button>
                       <div className="text-sm text-gray-400 mt-2 font-bold">點擊修改</div>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {currentView === 'history' && (
          <div className="flex-1 bg-white p-8 overflow-y-auto">
             <div className="max-w-6xl mx-auto">
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-6">
                   <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                     <History className="text-blue-600" size={36} />
                     本日銷售紀錄
                   </h2>

                   {/* 顯示當前日期 */}
                   <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                     <span className="text-blue-700 font-bold text-lg">
                       {DateUtils.formatDate(new Date())}
                     </span>
                   </div>
                 </div>

                 <div className="flex gap-4 items-center">
                    <button onClick={handleOpenExportMenu} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg font-bold text-xl transition-colors"><FolderOpen size={24} /> 匯出報表選單</button>

                    {/* 交易數量指示器 */}
                    <div className="bg-green-50 px-6 py-4 rounded-xl border-2 border-green-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700 font-bold text-lg">今日交易數量</span>
                      </div>
                      <span className="text-3xl font-black text-green-900">
                        {filteredTransactions.length} 筆
                      </span>
                    </div>

                    {/* 營收指示器 */}
                    <div className="bg-blue-50 px-6 py-4 rounded-xl border-2 border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="text-blue-600" size={20} />
                        <span className="text-blue-700 font-bold text-lg">今日總營收</span>
                      </div>
                      <span className="text-3xl font-black text-blue-900">
                        ${displayedRevenue.toLocaleString()}
                      </span>
                    </div>
                 </div>
               </div>
               {filteredTransactions.length === 0 ? (
                 <div className="text-center py-32 bg-blue-50 rounded-3xl border-4 border-dashed border-blue-200">
                   <Package className="mx-auto text-blue-300 mb-6" size={100} />
                   <p className="text-3xl font-black text-blue-600 mb-2">
                     今日尚無交易資料
                   </p>
                   <p className="text-xl text-blue-500 font-medium">
                     📅 {DateUtils.formatDate(new Date())} - 園遊會營業即將開始
                   </p>
                   <div className="mt-6 text-lg text-blue-400">
                     💡 開始掃描商品條碼或點擊商品即可建立第一筆交易
                   </div>
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-gray-100 border-b-2 border-gray-200 text-gray-600 text-lg">
                       <tr>
                         <th className="px-8 py-5 font-bold">時間</th>
                         <th className="px-8 py-5 font-bold">內容摘要</th>
                         <th className="px-8 py-5 font-bold text-right">金額</th>
                         <th className="px-8 py-5 font-bold text-right">找零</th>
                         <th className="px-8 py-5 font-bold text-center">狀態</th>
                         <th className="px-8 py-5 font-bold text-center">操作</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-gray-100 text-lg">
                       {filteredTransactions.map(t => (
                         <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                           <td className="px-8 py-6 text-gray-700 font-bold">
                            <div className="text-lg font-bold">{t.time.split(' ')[1] || t.time}</div>
                            <div className="text-sm text-gray-500 font-normal">{t.time.split(' ')[0] || new Date(t.time).toLocaleDateString()}</div>
                          </td>
                           <td className="px-8 py-6">
                             <div className="font-bold text-gray-900 mb-1">{t.items.length} 項商品</div>
                             <div className="text-base text-gray-500 truncate max-w-md">{t.items.map(i => i.name).join(', ')}</div>
                           </td>
                           <td className="px-8 py-6 text-right font-black text-2xl text-gray-900">${t.total}</td>
                           <td className="px-8 py-6 text-right text-gray-600 font-medium text-base">{t.received ? (<><div className="mb-1">收: ${t.received}</div><div className="text-green-700 font-bold text-xl bg-green-100 px-2 py-0.5 rounded inline-block">找: ${t.change}</div></>) : '-'}</td>
                           <td className="px-8 py-6 text-center">
                             <span className="inline-block px-4 py-2 text-sm font-bold text-green-800 bg-green-200 rounded-full">已完成</span>
                             {t.isModified && <div className="text-xs text-orange-600 font-bold mt-1">(已修改)</div>}
                           </td>
                           <td className="px-8 py-6 text-center">
                             <div className="flex items-center justify-center gap-2">
                               <button onClick={() => handleEditTransaction(t)} className="text-orange-500 hover:bg-orange-50 p-3 rounded-lg border border-orange-200 hover:border-orange-300 font-bold flex items-center gap-1 transition-colors" title="修改訂單"><Edit3 size={20} /> 修改</button>
                               <button onClick={() => voidTransactionWithStockRestore(t.id, t.items)} className="text-red-500 hover:bg-red-50 p-3 rounded-lg border border-red-200 hover:border-red-300 font-bold flex items-center gap-1 transition-colors" title="刪除訂單"><Trash2 size={20} /> 刪除</button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* VIEW: Settings */}
        {currentView === 'settings' && (
          <div className="flex-1 bg-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3"><Settings className="text-blue-600" size={36}/>系統設定</h2>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-100 px-8 py-6 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3"><ScanLine size={28}/> 條碼掃描設定</h3>
                  <p className="text-gray-500 mt-2">選擇您使用的條碼格式，系統會依此顯示提示標籤。</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BARCODE_FORMATS.map(fmt => (
                      <button key={fmt.id} onClick={() => setSettings({ ...settings, barcodeFormat: fmt.id })} className={`relative flex flex-col p-6 rounded-2xl border-4 text-left transition-all active:scale-95 ${settings.barcodeFormat === fmt.id ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-start w-full mb-2">
                          <span className="text-2xl font-black text-gray-800">{fmt.name}</span>
                          {settings.barcodeFormat === fmt.id && <CheckCircle className="text-blue-600" size={32} fill="currentColor" stroke="white" />}
                        </div>
                        <p className="text-gray-500 font-medium text-lg">{fmt.desc}</p>
                        <div className={`mt-4 px-3 py-1 rounded text-sm font-bold w-fit ${fmt.color}`}>範例標籤</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-100 px-8 py-6 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3"><CheckSquare size={28}/> 掃描測試區</h3>
                  <p className="text-gray-500 mt-2">請在此測試您的掃描槍是否能正確讀取。</p>
                </div>
                <div className="p-8">
                  <input type="text" placeholder="請在此掃描任意條碼..." className="w-full p-6 text-3xl font-bold border-4 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none text-center text-gray-600" onKeyDown={(e) => { if (e.key === 'Enter') { playSound('beep'); alert(`掃描成功！內容：${e.target.value}`); e.target.value = ''; } }} />
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-100 px-8 py-6 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3"><Monitor size={28}/> Demo 模式設定</h3>
                  <p className="text-gray-500 mt-2">啟用 Demo 模式將使用模擬資料，所有操作不會影響真實資料，適合測試用途。</p>
                </div>
                <div className="p-8">
                  {/* Demo 模式開關 */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <label htmlFor="demo-mode-toggle" className="text-2xl font-black text-gray-800 cursor-pointer">啟用 Demo 模式</label>
                      <p className="text-gray-600 mt-1">切換到預設模擬資料，所有更改將是暫時性的。</p>
                    </div>
                    <label htmlFor="demo-mode-toggle" className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="demo-mode-toggle" className="sr-only peer" checked={isDemoMode} onChange={handleToggleDemoMode} />
                      <div className="w-20 h-10 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Demo 資料管理 */}
                  {isDemoMode && (
                    <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-4">
                        <RefreshCw className="text-orange-600" size={24} />
                        <h4 className="text-xl font-black text-orange-800">Demo 資料管理</h4>
                      </div>
                      <p className="text-orange-700 mb-4 font-medium">
                        如果您在 Demo 模式中刪除了交易或修改了庫存，可以使用下方按鈕恢復為原始的示範資料。
                      </p>
                      <button
                        onClick={handleResetDemoData}
                        className="w-full py-4 rounded-xl bg-orange-500 text-white font-black text-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <RotateCcw size={24} /> 🔄 重置為原始 Demo 資料
                      </button>
                      <p className="text-center text-orange-600 mt-3 text-sm font-bold">
                        這將恢復所有原始的交易紀錄和商品庫存
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-red-50 rounded-3xl shadow-xl border-2 border-red-200 overflow-hidden">
                <div className="bg-red-100 px-8 py-6 border-b-2 border-red-200">
                  <h3 className="text-2xl font-black text-red-800 flex items-center gap-3"><AlertTriangle size={28}/> 危險區域</h3>
                  <p className="text-red-600 mt-2 font-bold">請小心操作，此動作無法復原。</p>
                </div>
                <div className="p-8">
                  <button onClick={handleResetSystem} className="w-full py-4 rounded-xl bg-red-600 text-white font-black text-xl shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3"><Trash2 size={24} /> ⚠️ 清除所有資料並重置系統</button>
                  <p className="text-center text-gray-500 mt-4 font-bold">這將會刪除所有銷售紀錄、重置庫存，並將系統恢復到初始狀態。</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}