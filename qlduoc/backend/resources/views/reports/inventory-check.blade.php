<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Biên bản kiểm kê</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 13px;
        }
        .header {
            width: 100%;
            margin-bottom: 20px;
        }
        .header-left {
            width: 40%;
            float: left;
        }
        .header-center {
            width: 60%;
            float: left;
            text-align: center;
        }
        .title {
            font-weight: bold;
            font-size: 18px;
            text-transform: uppercase;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th, .table td {
            border: 1px solid black;
            padding: 5px;
            font-size: 12px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .italic { font-style: italic; }
        .footer {
            margin-top: 30px;
            width: 100%;
            display: table;
        }
        .footer-left, .footer-right {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="font-bold">Trạm Y tế phường Bồ Đề</div>
            <div>Trạm y tế phường Bồ Đề 01218</div>
        </div>
        <div class="header-center">
            <div class="title">BIÊN BẢN KIỂM KÊ</div>
            <div class="italic">Từ ngày {{ \Carbon\Carbon::parse($fromDate)->format('d/m/Y') }} đến ngày {{ \Carbon\Carbon::parse($toDate)->format('d/m/Y') }}</div>
        </div>
        <div style="clear: both;"></div>
    </div>

    <div style="margin-bottom: 20px;">
        <div><span class="font-bold">Kho:</span> {{ $warehouseName }}</div>
        <div class="font-bold" style="margin-top: 10px;">Tổ kiểm kê gồm có:</div>
        <ol style="margin-top: 5px; padding-left: 20px;">
            @foreach($council as $idx => $c)
                <li style="margin-bottom: 5px;">
                    <span style="display: inline-block; width: 200px;">{{ $c['name'] }}</span>
                    <span class="font-bold">Chức vụ:</span> {{ $c['position'] }}
                </li>
            @endforeach
        </ol>
    </div>

    <div style="margin-bottom: 10px;">
        <div>Đã kiểm kê tại: Trạm y tế phường Bồ Đề 01218</div>
        <div class="italic text-right">từ giờ......ngày......tháng......năm...... đến giờ......ngày......tháng......năm......</div>
        <div class="font-bold" style="margin-top: 10px;">Kết quả như sau:</div>
    </div>

    <table class="table">
        <thead>
            <tr style="background-color: #f3f3f3;">
                <th rowspan="2" style="width: 30px;">STT</th>
                <th rowspan="2">Tên nhãn hiệu, quy cách phẩm chất</th>
                <th rowspan="2" style="width: 50px;">ĐVT</th>
                <th rowspan="2">Nước sản xuất</th>
                <th rowspan="2">Lô sản xuất</th>
                <th rowspan="2">Hạn dùng</th>
                <th colspan="2">Số lượng</th>
                <th rowspan="2">Đơn giá</th>
                <th rowspan="2">Thành tiền</th>
                <th rowspan="2">Ghi chú</th>
            </tr>
            <tr style="background-color: #f3f3f3;">
                <th>Sổ sách</th>
                <th>Thực tế</th>
            </tr>
            <tr>
                @for($i = 0; $i < 11; $i++)
                    <th class="italic normal-weight">{{ ['A','B','C','D','E','1','2','3','4','5','6'][$i] ?? '' }}</th>
                @endfor
            </tr>
        </thead>
        <tbody>
            @if(count($items) > 0)
                @foreach($items as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-bold">{{ $item['product_name'] }}</td>
                        <td class="text-center">{{ $item['unit'] }}</td>
                        <td class="text-center">{{ $item['country'] }}</td>
                        <td class="text-center">{{ $item['batch_number'] }}</td>
                        <td class="text-center">{{ $item['expiry_date'] }}</td>
                        <td class="text-right font-bold">{{ number_format($item['book_quantity'], 0, ',', '.') }}</td>
                        <td></td> <!-- Thuc te -->
                        <td class="text-right">{{ number_format($item['unit_price'], 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($item['total_amount'], 0, ',', '.') }}</td>
                        <td></td>
                    </tr>
                @endforeach
                <tr class="font-bold">
                    <td colspan="9" class="text-right">Tổng cộng:</td>
                    <td class="text-right">{{ number_format(collect($items)->sum('total_amount'), 0, ',', '.') }}</td>
                    <td></td>
                </tr>
            @else
                <tr><td colspan="11" class="text-center">Không có dữ liệu</td></tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <div class="footer-left">
            <div class="font-bold">Thư Ký</div>
            <div style="margin-top: 80px;">(Ký, họ tên)</div>
        </div>
        <div class="footer-right">
            <div class="italic" style="margin-bottom: 5px;">Ngày {{ date('d') }} tháng {{ date('m') }} năm {{ date('Y') }}</div>
            <div class="font-bold">Trưởng Ban</div>
            <div style="margin-top: 80px;">(Ký, họ tên, đóng dấu)</div>
        </div>
    </div>
</body>
</html>
