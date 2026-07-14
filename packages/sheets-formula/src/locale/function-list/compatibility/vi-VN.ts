/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type enUS from './en-US';

const locale: typeof enUS = {
    BETADIST: {
        description: 'Trả về hàm mật độ xác suất beta lũy tích. Phân bố beta thường được dùng để nghiên cứu sự biến thiên theo tỷ lệ phần trăm của một số thứ qua các mẫu, chẳng hạn như thời gian trong ngày mà người ta dành để xem ti vi.',
        abstract: 'Trả về hàm mật độ xác suất beta lũy tích. Phân bố beta thường được dùng để nghiên cứu sự biến thiên theo tỷ lệ phần trăm của một số thứ qua các mẫu, chẳng hạn như thời gian trong ngày mà người ta dành để xem ti vi.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'buộc. Giá trị giữa A và B dùng để định trị hàm.' },
            alpha: { name: 'alpha', detail: 'Yêu cầu. Một tham biến của phân phối.' },
            beta: { name: 'beta', detail: 'Yêu cầu. Một tham biến của phân phối.' },
            A: { name: 'giới hạn dưới', detail: 'Tùy chọn. Cận dưới của khoảng x.' },
            B: { name: 'giới hạn trên', detail: 'chọn. Cận trên của khoảng x.' },
        },
    },
    BETAINV: {
        description: 'Trả về giá trị nghịch đảo của hàm mật độ xác suất beta lũy tích cho một phân bố beta đã xác định. Tức là, nếu xác suất = BETADIST(x,...) thì BETAINV(xác suất,...) = x. Có thể dùng phân bố beta trong lập kế hoạch dự án để làm mẫu thời gian có thể hoàn thành trên cơ sở thời gian dự kiến và khả năng có sự thay đổi.',
        abstract: 'Trả về giá trị nghịch đảo của hàm mật độ xác suất beta lũy tích cho một phân bố beta đã xác định. Tức là, nếu xác suất = BETADIST(x,...) thì BETAINV(xác suất,...) = x. Có thể dùng phân bố beta trong lập kế hoạch dự án để làm mẫu thời gian có thể hoàn thành trên cơ sở thời gian dự kiến và khả năng có sự thay đổi.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Xác suất gắn với phân bố beta.' },
            alpha: { name: 'alpha', detail: 'Yêu cầu. Một tham biến của phân phối.' },
            beta: { name: 'beta', detail: 'Yêu cầu. Tham số phân bố.' },
            A: { name: 'giới hạn dưới', detail: 'Tùy chọn. Cận dưới của khoảng x.' },
            B: { name: 'giới hạn trên', detail: 'chọn. Cận trên của khoảng x.' },
        },
    },
    BINOMDIST: {
        description: 'Trả về xác suất phân bố nhị thức của thuật ngữ riêng lẻ. Hãy dùng BINOMDIST trong các vấn đề có số lượng kiểm định hoặc phép thử ấn định khi kết quả của bất kỳ phép thử nào chỉ là thành công hay thất bại, khi các phép thử là độc lập và khi xác suất thành công không đổi trong suốt quá trình thử nghiệm. Ví dụ, BINOMDIST có thể tính toán xác suất rằng hai trong số ba em bé tiếp theo là bé trai.',
        abstract: 'Trả về xác suất phân bố nhị thức của thuật ngữ riêng lẻ. Hãy dùng BINOMDIST trong các vấn đề có số lượng kiểm định hoặc phép thử ấn định khi kết quả của bất kỳ phép thử nào chỉ là thành công hay thất bại, khi các phép thử là độc lập và khi xác suất thành công không đổi trong suốt quá trình thử nghiệm. Ví dụ, BINOMDIST có thể tính toán xác suất rằng hai trong số ba em bé tiếp theo là bé trai.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'số lần thành công', detail: 'Yêu cầu. Số lần thành công trong các phép thử.' },
            trials: { name: 'số phép thử', detail: 'Yêu cầu. Số phép thử độc lập.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Yêu cầu. Xác suất thành công của mỗi phép thử.' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là ĐÚNG thì BINOMDIST trả về hàm phân bố lũy tích, là xác suất có nhiều nhất số lần thành công; nếu SAI, nó trả về hàm khối xác suất, là xác suất có số lần thành công.' },
        },
    },
    CHIDIST: {
        description: 'Trả về xác suất đầu bên phải của phân bố khi bình phương. Phân bố χ2 gắn với kiểm thử χ2. Hãy dùng kiểm thử χ2 để so sánh các giá trị quan sát được và dự kiến. Ví dụ, thí nghiệm di truyền có thể đưa ra giả thuyết rằng thế hệ tiếp theo của cây trồng sẽ có một bộ màu nhất định. Bằng cách so sánh kết quả quan sát được với kết quả dự kiến, bạn có thể xác định giả thuyết ban đầu của mình có hợp lệ hay không.',
        abstract: 'Trả về xác suất đầu bên phải của phân bố khi bình phương. Phân bố χ2 gắn với kiểm thử χ2. Hãy dùng kiểm thử χ2 để so sánh các giá trị quan sát được và dự kiến. Ví dụ, thí nghiệm di truyền có thể đưa ra giả thuyết rằng thế hệ tiếp theo của cây trồng sẽ có một bộ màu nhất định. Bằng cách so sánh kết quả quan sát được với kết quả dự kiến, bạn có thể xác định giả thuyết ban đầu của mình có hợp lệ hay không.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'buộc. Giái trị bạn muốn đánh giá phân phối.' },
            degFreedom: { name: 'bậc tự do', detail: 'Yêu cầu. Số bậc tự do.' },
        },
    },
    CHIINV: {
        description: 'Trả về giá trị nghịch đảo của xác suất đầu bên phải của phân bố khi bình phương. Nếu xác suất = CHIDIST(x,...) thì CHIINV(xác suất,...) = x. Hãy dùng hàm này để so sánh kết quả quan sát được với kết quả dự kiến để xác định giả thuyết ban đầu của bạn có hợp lệ hay không.',
        abstract: 'Trả về giá trị nghịch đảo của xác suất đầu bên phải của phân bố khi bình phương. Nếu xác suất = CHIDIST(x,...) thì CHIINV(xác suất,...) = x. Hãy dùng hàm này để so sánh kết quả quan sát được với kết quả dự kiến để xác định giả thuyết ban đầu của bạn có hợp lệ hay không.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Xác suất gắn với phân bố khi bình phương.' },
            degFreedom: { name: 'bậc tự do', detail: 'Yêu cầu. Số bậc tự do.' },
        },
    },
    CHITEST: {
        description: 'Trả về kiểm định tính độc lập. CHITEST trả về giá trị từ phân bố (χ2) khi bình phương cho thống kê và bậc tự do phù hợp. Bạn có thể dùng kiểm định χ2 để xác định kết quả được giả thuyết có được thí nghiệm xác nhận hay không.',
        abstract: 'Trả về kiểm định tính độc lập. CHITEST trả về giá trị từ phân bố (χ2) khi bình phương cho thống kê và bậc tự do phù hợp. Bạn có thể dùng kiểm định χ2 để xác định kết quả được giả thuyết có được thí nghiệm xác nhận hay không.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'phạm vi quan sát', detail: 'Yêu cầu. Phạm vi dữ liệu chứa các quan sát để kiểm thử đối với các giá trị dự kiến.' },
            expectedRange: { name: 'phạm vi dự kiến', detail: 'Yêu cầu. Phạm vi dữ liệu chứa tỷ lệ của phép nhân tổng hàng và tổng cột với tổng cộng.' },
        },
    },
    CONFIDENCE: {
        description: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        abstract: 'Trả về khoảng tin cậy của trung bình tổng thể, bằng cách dùng phân bố chuẩn hóa.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Yêu cầu. Mức quan trọng được dùng để tính toán mức tin cậy. Mức tin cậy bằng 100*(1 - alpha)%, hay nói cách khác, alpha 0,05 cho biết mức tin cậy 95 phần trăm.' },
            standardDev: { name: 'Độ lệch chuẩn tổng', detail: 'Yêu cầu. Độ lệch chuẩn tổng thể cho phạm vi dữ liệu và được giả định là đã được xác định.' },
            size: { name: 'cỡ mẫu', detail: 'Yêu cầu. Cỡ mẫu.' },
        },
    },
    COVAR: {
        description: 'Trả về hiệp phương sai, trung bình tích của các độ lệch cho mỗi cặp điểm dữ liệu trong hai tập dữ liệu.',
        abstract: 'Trả về hiệp phương sai, trung bình tích của các độ lệch cho mỗi cặp điểm dữ liệu trong hai tập dữ liệu.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Yêu cầu. Phạm vi ô thứ nhất chứa các số nguyên.' },
            array2: { name: 'mảng 2', detail: 'Yêu cầu. Phạm vi ô thứ hai chứa các số nguyên.' },
        },
    },
    CRITBINOM: {
        description: 'Trả về giá trị nhỏ nhất sao cho phân bố nhị thức lũy tích lớn hơn hoặc bằng một giá trị tiêu chí. Dùng hàm này cho các ứng dụng bảo đảm chất lượng. Ví dụ, dùng hàm CRITBINOM để xác định số lượng bộ phận bị hỏng lớn nhất được cho phép để chạy dây chuyền lắp ráp mà không từ chối toàn bộ lô hàng.',
        abstract: 'Trả về giá trị nhỏ nhất sao cho phân bố nhị thức lũy tích lớn hơn hoặc bằng một giá trị tiêu chí. Dùng hàm này cho các ứng dụng bảo đảm chất lượng. Ví dụ, dùng hàm CRITBINOM để xác định số lượng bộ phận bị hỏng lớn nhất được cho phép để chạy dây chuyền lắp ráp mà không từ chối toàn bộ lô hàng.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'số phép thử', detail: 'Yêu cầu. Số phép thử Bernoulli.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Yêu cầu. Xác suất thành công của mỗi phép thử.' },
            alpha: { name: 'xác suất mục tiêu', detail: 'Yêu cầu. Giá trị tiêu chí.' },
        },
    },
    EXPONDIST: {
        description: 'Trả về phân bố hàm mũ. Dùng hàm EXPONDIST để làm mẫu thời gian giữa các sự kiện, chẳng hạn như máy rút tiền tự động cần bao nhiêu thời gian để giao tiền mặt. Ví dụ, bạn có thể dùng hàm EXPONDIST để xác định xác suất quá trình này diễn ra trong nhiều nhất là 1 phút.',
        abstract: 'Trả về phân bố hàm mũ. Dùng hàm EXPONDIST để làm mẫu thời gian giữa các sự kiện, chẳng hạn như máy rút tiền tự động cần bao nhiêu thời gian để giao tiền mặt. Ví dụ, bạn có thể dùng hàm EXPONDIST để xác định xác suất quá trình này diễn ra trong nhiều nhất là 1 phút.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'buộc. Giá trị của hàm.' },
            lambda: { name: 'lambda', detail: 'Yêu cầu. Giá trị tham số.' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Giá trị lô-gic cho biết cung cấp kiểu hàm mũ nào. Nếu cumulative là TRUE, hàm EXPONDIST trả về hàm phân bố lũy tích; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    FDIST: {
        description: 'Trả về phân bố xác suất (mức đa dạng) F (bên phải) cho hai tập dữ liệu. Bạn có thể dùng hàm này để xác định hai tập dữ liệu có mức đa dạng khác nhau hay không. Ví dụ, bạn có thể xem xét điểm kiểm tra của học sinh nam và học sinh nữ tại trường trung học và xác định mức biến đổi trong học sinh nữ có khác với mức đó trong học sinh nam không.',
        abstract: 'Trả về phân bố xác suất (mức đa dạng) F (bên phải) cho hai tập dữ liệu. Bạn có thể dùng hàm này để xác định hai tập dữ liệu có mức đa dạng khác nhau hay không. Ví dụ, bạn có thể xem xét điểm kiểm tra của học sinh nam và học sinh nữ tại trường trung học và xác định mức biến đổi trong học sinh nữ có khác với mức đó trong học sinh nam không.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'số', detail: 'buộc. Giá trị để đánh giá hàm.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Yêu cầu. Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Yêu cầu. Bậc tự do ở mẫu số.' },
        },
    },
    FINV: {
        description: 'Trả về nghịch đảo của phân bố xác suất F (đầu bên phải). Nếu p = FDIST(x,...), thì FINV(p,...) = x.',
        abstract: 'Trả về nghịch đảo của phân bố xác suất F (đầu bên phải). Nếu p = FDIST(x,...), thì FINV(p,...) = x.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Xác suất gắn với phân bố lũy tích F.' },
            degFreedom1: { name: 'bậc tự do ở tử số', detail: 'Yêu cầu. Bậc tự do ở tử số.' },
            degFreedom2: { name: 'bậc tự do ở mẫu số.', detail: 'Yêu cầu. Bậc tự do ở mẫu số.' },
        },
    },
    FTEST: {
        description: 'Trả về kết quả của kiểm tra F-test. Một kiểm tra F-test trả về xác suất hai đầu mà phương sai trong array1 và array1 khác nhau không đáng kể. Dùng hàm này để xác định xem hai mẫu có các phương sai khác nhau không. Ví dụ, biết điểm kiểm tra của các trường công lập và trường tư thục, bạn có thể kiểm tra xem những trường này có các mức điểm số kiểm tra khác nhau hay không.',
        abstract: 'Trả về kết quả của kiểm tra F-test. Một kiểm tra F-test trả về xác suất hai đầu mà phương sai trong array1 và array1 khác nhau không đáng kể. Dùng hàm này để xác định xem hai mẫu có các phương sai khác nhau không. Ví dụ, biết điểm kiểm tra của các trường công lập và trường tư thục, bạn có thể kiểm tra xem những trường này có các mức điểm số kiểm tra khác nhau hay không.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Yêu cầu. Mảng thứ nhất của phạm vi dữ liệu.' },
            array2: { name: 'mảng 2', detail: 'Yêu cầu. Mảng thứ hai của phạm vi dữ liệu.' },
        },
    },
    GAMMADIST: {
        description: 'Trả về phân bố gamma. Bạn có thể dùng hàm này để nghiên cứu các biến số có thể có phân bố lệch. Phân bố gamma thường được dùng trong phân tích hàng đợi.',
        abstract: 'Trả về phân bố gamma. Bạn có thể dùng hàm này để nghiên cứu các biến số có thể có phân bố lệch. Phân bố gamma thường được dùng trong phân tích hàng đợi.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Giái trị bạn muốn đánh giá phân phối.' },
            alpha: { name: 'alpha', detail: 'Yêu cầu. Một tham biến tới phân phối.' },
            beta: { name: 'beta', detail: 'Yêu cầu. Một tham biến tới phân phối. Nếu beta = 1, GAMMADIST trả về phân bố gamma chuẩn.' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Một giá trị lô-gic quyết định dạng thức của hàm. Nếu tích lũy là TRUE, hàm GAMMADIST trả về hàm phân bố tích lũy; nếu FALSE, nó trả về hàm mật độ xác suất.' },
        },
    },
    GAMMAINV: {
        description: 'Trả về giá trị đảo của phân bố lũy tích gamma. Nếu p = GAMMADIST(x,...), thì GAMMAINV(p,...) = x. Bạn có thể dùng hàm này để nghiên cứu các biến số mà phân bố của chúng có thể là đối xứng lệch.',
        abstract: 'Trả về giá trị đảo của phân bố lũy tích gamma. Nếu p = GAMMADIST(x,...), thì GAMMAINV(p,...) = x. Bạn có thể dùng hàm này để nghiên cứu các biến số mà phân bố của chúng có thể là đối xứng lệch.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Xác xuất gắn với phân bố gamma.' },
            alpha: { name: 'alpha', detail: 'Yêu cầu. Một tham biến tới phân phối.' },
            beta: { name: 'beta', detail: 'Yêu cầu. Một tham biến tới phân phối. Nếu beta = 1, GAMMAINV trả về phân bố gamma chuẩn.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Trả về phân bố siêu bội. Hàm HYPGEOMDIST trả về xác suất của số lần thành công mẫu đã biết, biết trước kích thước mẫu, thành công của tập hợp và kích cỡ của tập hợp. Dùng hàm HYPGEOMDIST cho các vấn đề về tập hợp hữu hạn, trong đó mỗi quan sát có thể là thành công hoặc thất bại và trong đó mỗi tập con có kích thước đã biết được chọn với khả năng như nhau.',
        abstract: 'Trả về phân bố siêu bội. Hàm HYPGEOMDIST trả về xác suất của số lần thành công mẫu đã biết, biết trước kích thước mẫu, thành công của tập hợp và kích cỡ của tập hợp. Dùng hàm HYPGEOMDIST cho các vấn đề về tập hợp hữu hạn, trong đó mỗi quan sát có thể là thành công hoặc thất bại và trong đó mỗi tập con có kích thước đã biết được chọn với khả năng như nhau.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'Số lần thành công mẫu', detail: 'Yêu cầu. Số lần thành công trong mẫu.' },
            numberSample: { name: 'Kích thước mẫu', detail: 'Yêu cầu. Kích thước của mẫu.' },
            populationS: { name: 'Tổng số thành công', detail: 'Yêu cầu. Số lần thành công trong tập hợp.' },
            numberPop: { name: 'Kích thước tổng thể', detail: 'Yêu cầu. Kích thước của tập hợp.' },
        },
    },
    LOGINV: {
        description: 'Trả về nghịch đảo của hàm phân phối lô-ga-rit chuẩn lũy tích của x, trong đó ln(x) thường được phân bố với tham số trung bình và độ lệch chuẩn. Nếu p = LOGNORMDIST(x,...), khi đó LOGINV(p,...) = x.',
        abstract: 'Trả về nghịch đảo của hàm phân phối lô-ga-rit chuẩn lũy tích của x, trong đó ln(x) thường được phân bố với tham số trung bình và độ lệch chuẩn. Nếu p = LOGNORMDIST(x,...), khi đó LOGINV(p,...) = x.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Một xác suất gắn với phân bố lô-ga-rit chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Yêu cầu. Trung bình của ln(x).' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Yêu cầu. Độ lệch chuẩn của ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Trả về phân bố chuẩn lô-ga-rít lũy tích của x, trong đó ln(x) thường được phân bố với trung bình tham số và độ lệch chuẩn. Dùng hàm này để phân tích những dữ liệu đã được biến đổi theo lô-ga-rit.',
        abstract: 'Trả về phân bố chuẩn lô-ga-rít lũy tích của x, trong đó ln(x) thường được phân bố với trung bình tham số và độ lệch chuẩn. Dùng hàm này để phân tích những dữ liệu đã được biến đổi theo lô-ga-rit.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Giá trị để đánh giá hàm.' },
            mean: { name: 'trung độ số', detail: 'Yêu cầu. Trung bình của ln(x).' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Yêu cầu. Độ lệch chuẩn của ln(x).' },
        },
    },
    MODE: {
        description: 'Giả sử bạn muốn tìm hiểu số lượng loài chim phổ biến nhất bị nhìn thấy trong một mẫu số lượng chim tại một vùng ngập nước quan trọng trong khoảng thời gian 30 năm, hoặc bạn muốn tìm số lượng cuộc gọi điện thoại thường xuyên nhất tại một trung tâm hỗ trợ qua điện thoại trong giờ thấp điểm. Để tính toán chế độ của một nhóm số, hãy sử dụng hàm MODE .',
        abstract: 'Giả sử bạn muốn tìm hiểu số lượng loài chim phổ biến nhất bị nhìn thấy trong một mẫu số lượng chim tại một vùng ngập nước quan trọng trong khoảng thời gian 30 năm, hoặc bạn muốn tìm số lượng cuộc gọi điện thoại thường xuyên nhất tại một trung tâm hỗ trợ qua điện thoại trong giờ thấp điểm. Để tính toán chế độ của một nhóm số, hãy sử dụng hàm MODE .',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'số 1', detail: 'Yêu cầu. Đối số dạng số đầu tiên cho những gì bạn muốn tính số yếu vị.' },
            number2: { name: 'số 2', detail: 'Tùy chọn. Các đối số dạng số từ 2 tới 255 mà bạn muốn tính toán số yếu vị trong đó. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Trả về phân bố nhị thức âm. Hàm NEGBINOMDIST trả về xác suất sẽ có number_f lần thất bại trước thành công thứ number_s, khi xác suất không đổi của một lần thành công là probability_s. Hàm này tương tự như phân bố nhị thức, ngoại trừ việc số lần thành công được cố định và số lần thử biến đổi. Giống như phân bố nhị thức, số lần thử được giả định là độc lập.',
        abstract: 'Trả về phân bố nhị thức âm. Hàm NEGBINOMDIST trả về xác suất sẽ có number_f lần thất bại trước thành công thứ number_s, khi xác suất không đổi của một lần thành công là probability_s. Hàm này tương tự như phân bố nhị thức, ngoại trừ việc số lần thành công được cố định và số lần thử biến đổi. Giống như phân bố nhị thức, số lần thử được giả định là độc lập.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'số lần thất bại.', detail: 'Yêu cầu. Số lần thất bại.' },
            numberS: { name: 'số lần thành công', detail: 'Yêu cầu. Số ngưỡng thành công.' },
            probabilityS: { name: 'xác suất thành công', detail: 'Yêu cầu. Xác suất thành công.' },
        },
    },
    NORMDIST: {
        description: 'Hàm NORMDIST trả về phân bố chuẩn cho độ lệch chuẩn và giá trị trung độ đã xác định. Hàm này có một loạt các ứng dụng trong thống kê, bao gồm kiểm tra giả thuyết.',
        abstract: 'Hàm NORMDIST trả về phân bố chuẩn cho độ lệch chuẩn và giá trị trung độ đã xác định. Hàm này có một loạt các ứng dụng trong thống kê, bao gồm kiểm tra giả thuyết.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Giá trị mà bạn muốn có phân bố của nó' },
            mean: { name: 'trung độ số', detail: 'Yêu cầu. Trung bình số học của phân bố' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Yêu cầu. Độ lệch chuẩn của phân bố' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Một giá trị lô-gic quyết định dạng thức của hàm. Nếu lũy tích là TRUE, thì hàm NORMDIST trả về hàm phân bố lũy tích; nếu lũy tích là FALSE, nó trả về hàm khối xác suất.' },
        },
    },
    NORMINV: {
        description: 'Trả về nghịch đảo của phân bố lũy tích chuẩn với độ lệch chuẩn và giá trị trung độ đã xác định.',
        abstract: 'Trả về nghịch đảo của phân bố lũy tích chuẩn với độ lệch chuẩn và giá trị trung độ đã xác định.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Một xác suất tương ứng với phân bố chuẩn.' },
            mean: { name: 'trung độ số', detail: 'Yêu cầu. Trung độ số học của phân phối.' },
            standardDev: { name: 'Độ lệch chuẩn', detail: 'Yêu cầu. Độ lệch chuẩn của phân phối.' },
        },
    },
    NORMSDIST: {
        description: 'Trả về hàm phân bố lũy tích chuẩn chuẩn hóa. Phân bố có giá trị trung độ bằng 0 (không) và độ lệch chuẩn là một. Dùng hàm này thay cho bảng chứa các vùng đường cong chuẩn chuẩn hóa.',
        abstract: 'Trả về hàm phân bố lũy tích chuẩn chuẩn hóa. Phân bố có giá trị trung độ bằng 0 (không) và độ lệch chuẩn là một. Dùng hàm này thay cho bảng chứa các vùng đường cong chuẩn chuẩn hóa.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'buộc. Giá trị mà bạn muốn có phân bố của nó.' },
        },
    },
    NORMSINV: {
        description: 'Trả về giá trị đảo của phân bố lũy tích chuẩn chuẩn hóa. Phân bố có giá trị trung bình bằng không và độ lệch chuẩn là một.',
        abstract: 'Trả về giá trị đảo của phân bố lũy tích chuẩn chuẩn hóa. Phân bố có giá trị trung bình bằng không và độ lệch chuẩn là một.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Một xác suất tương ứng với phân bố chuẩn.' },
        },
    },
    PERCENTILE: {
        description: 'Trả về phân vị thứ k của các giá trị trong phạm vi. Bạn có thể dùng hàm này để thiết lập ngưỡng chấp nhận. Ví dụ, bạn có thể quyết định kiểm tra những ứng viên đạt điểm cao hơn phân vị thứ 90.',
        abstract: 'Trả về phân vị thứ k của các giá trị trong phạm vi. Bạn có thể dùng hàm này để thiết lập ngưỡng chấp nhận. Ví dụ, bạn có thể quyết định kiểm tra những ứng viên đạt điểm cao hơn phân vị thứ 90.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Yêu cầu. Mảng hoặc phạm vi dữ liệu xác định vị trí tương đối.' },
            k: { name: 'k', detail: 'buộc. Giá trị phân vị trong phạm vi 0..1, bao gồm cả 0 và 1.' },
        },
    },
    PERCENTRANK: {
        description: 'Hàm PERCENTRANK trả về thứ hạng của một giá trị trong tập dữ liệu dưới dạng tỷ lệ phần trăm của tập dữ liệu -- về cơ bản, vị trí tương đối của một giá trị trong toàn bộ tập dữ liệu. Ví dụ, bạn có thể dùng hàm PERCENTRANK để xác định vị thế của điểm kiểm tra của một cá nhân trong số tất cả các điểm số của cùng một bài kiểm tra.',
        abstract: 'Hàm PERCENTRANK trả về thứ hạng của một giá trị trong tập dữ liệu dưới dạng tỷ lệ phần trăm của tập dữ liệu -- về cơ bản, vị trí tương đối của một giá trị trong toàn bộ tập dữ liệu. Ví dụ, bạn có thể dùng hàm PERCENTRANK để xác định vị thế của điểm kiểm tra của một cá nhân trong số tất cả các điểm số của cùng một bài kiểm tra.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Yêu cầu. Phạm vi dữ liệu (hoặc mảng xác định trước) của các giá trị số trong đó thứ hạng phần trăm được xác định.' },
            x: { name: 'x', detail: 'buộc. Giá trị mà bạn muốn biết thứ hạng trong mảng.' },
            significance: { name: 'chữ số có nghĩa', detail: 'Tùy chọn. Giá trị xác định số chữ số có nghĩa của giá trị phần trăm trả về. Nếu bỏ qua, hàm PERCENTRANK dùng ba chữ số (0.xxx).' },
        },
    },
    POISSON: {
        description: 'Trả về phân bố Poisson. Một ứng dụng thường gặp của phân bố Poisson là để dự đoán số sự kiện trong một thời gian cụ thể, chẳng hạn như số xe tới một trạm thu phí trong 1 phút.',
        abstract: 'Trả về phân bố Poisson. Một ứng dụng thường gặp của phân bố Poisson là để dự đoán số sự kiện trong một thời gian cụ thể, chẳng hạn như số xe tới một trạm thu phí trong 1 phút.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Số sự kiện.' },
            mean: { name: 'trung độ số', detail: 'Yêu cầu. Giá trị dạng số ước tính.' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Giá trị lô-gic xác định dạng thức của phân bố xác suất được trả về. Nếu lũy tích là TRUE, thì hàm POISSON trả về xác xuất Poisson lũy tích mà một số sự kiện ngẫu nhiên sẽ xảy ra từ không đến x, bao gồm cả không và x; nếu FALSE, nó trả về hàm khối xác xuất Poission mà số sự kiện xảy ra sẽ chính xác là x.' },
        },
    },
    QUARTILE: {
        description: 'Trả về tứ phân vị của tập dữ liệu. Tứ phân vị được dùng trong dữ liệu khảo sát và bán hàng để chia tập hợp thành các nhóm. Ví dụ, bạn có thể dùng hàm QUARTILE để tìm ra 25% số người có thu nhập cao nhất trong một tập hợp dân cư.',
        abstract: 'Trả về tứ phân vị của tập dữ liệu. Tứ phân vị được dùng trong dữ liệu khảo sát và bán hàng để chia tập hợp thành các nhóm. Ví dụ, bạn có thể dùng hàm QUARTILE để tìm ra 25% số người có thu nhập cao nhất trong một tập hợp dân cư.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Yêu cầu. Mảng hoặc phạm vi ô có chứa các giá trị số mà bạn muốn tìm giá trị tứ phân vị.' },
            quart: { name: 'giá trị tứ phân', detail: 'Yêu cầu. Chỉ rõ giá trị nào cần trả về.' },
        },
    },
    RANK: {
        description: 'Trả về thứ hạng của một số trong danh sách các số. Thứ hạng của số là kích thước của nó trong tương quan với các giá trị khác trong danh sách. (Nếu bạn cần sắp xếp danh sách, thì thứ hạng của số là vị trí của nó).',
        abstract: 'Trả về thứ hạng của một số trong danh sách các số. Thứ hạng của số là kích thước của nó trong tương quan với các giá trị khác trong danh sách. (Nếu bạn cần sắp xếp danh sách, thì thứ hạng của số là vị trí của nó).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'số', detail: 'Yêu cầu. Số mà bạn muốn tìm thứ hạng của nó.' },
            ref: { name: 'danh sách các số', detail: 'Yêu cầu. Tham chiếu tới danh sách các số. Các giá trị không phải là số trong tham chiếu sẽ được bỏ qua.' },
            order: { name: 'xếp hạng số', detail: 'Tùy chọn. Một con số chỉ rõ cách xếp hạng số. Nếu thứ tự là 0 (không) hoặc được bỏ qua, thì Microsoft Excel xếp hạng số giống như khi tham chiếu là một danh sách theo thứ tự giảm dần. Nếu thứ tự là bất kỳ giá trị nào khác không, thì Microsoft Excel xếp hạng số giống như khi tham chiếu là một danh sách theo thứ tự tăng dần.' },
        },
    },
    STDEV: {
        description: 'Ước tính độ lệch chuẩn dựa trên một mẫu. Độ lệch chuẩn là số đo độ phân tán của các giá trị so với giá trị trung bình (trung độ).',
        abstract: 'Ước tính độ lệch chuẩn dựa trên một mẫu. Độ lệch chuẩn là số đo độ phân tán của các giá trị so với giá trị trung bình (trung độ).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Yêu cầu. Đối số dạng số đầu tiên tương ứng với mẫu tổng thể.' },
            number2: { name: 'number2', detail: 'Tùy chọn. Đối số dạng số từ 2 đến 255 tương ứng với mẫu tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    STDEVP: {
        description: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tổng thể được cung cấp ở dạng đối số. Độ lệch chuẩn là số đo độ phân tán của các giá trị so với giá trị trung bình (trung độ).',
        abstract: 'Tính toán độ lệch chuẩn dựa trên toàn bộ tổng thể được cung cấp ở dạng đối số. Độ lệch chuẩn là số đo độ phân tán của các giá trị so với giá trị trung bình (trung độ).',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Yêu cầu. Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            number2: { name: 'number2', detail: 'Tùy chọn. Đối số dạng số từ 2 đến 255 tương ứng với tổng thể. Bạn cũng có thể sử dụng một mảng đơn hay tham chiếu tới một mảng thay thế cho các đối số được phân tách bởi dấu phẩy.' },
        },
    },
    TDIST: {
        description: 'Trả về các Điểm Phần trăm (xác suất) cho phân bố t Student, trong đó giá trị số (x) là giá trị tính toán của t và được dùng để tính các Điểm Phần trăm. Phân bố t được dùng trong kiểm tra giả thuyết của các tập dữ liệu mẫu có số lượng nhỏ. Hàm này được dùng thay cho bảng các giá trị cực độ của phân phối t.',
        abstract: 'Trả về các Điểm Phần trăm (xác suất) cho phân bố t Student, trong đó giá trị số (x) là giá trị tính toán của t và được dùng để tính các Điểm Phần trăm. Phân bố t được dùng trong kiểm tra giả thuyết của các tập dữ liệu mẫu có số lượng nhỏ. Hàm này được dùng thay cho bảng các giá trị cực độ của phân phối t.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Giá trị số dùng để đánh giá phân bố.' },
            degFreedom: { name: 'bậc tự do', detail: 'Yêu cầu. Là một số nguyên cho biết số bậc tự do.' },
            tails: { name: 'đặc điểm đuôi', detail: 'Yêu cầu. Xác định số phần dư của phân bố được trả về. Nếu Tails = 1, hàm TDIST sẽ trả về phân bố một phía. Nếu Tails = 2, hàm TDIST sẽ trả về phân bố hai phía.' },
        },
    },
    TINV: {
        description: 'Trả về nghịch đảo hai phía của phân bố t Student.',
        abstract: 'Trả về nghịch đảo hai phía của phân bố t Student.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'xác suất', detail: 'Yêu cầu. Xác xuất kết hợp với phân bố t Student hai phía.' },
            degFreedom: { name: 'bậc tự do', detail: 'Yêu cầu. Số bậc tự do biểu thị đặc điểm của phân bố.' },
        },
    },
    TTEST: {
        description: 'Trả về xác suất kết hợp với Phép thử t Student. Dùng hàm TTEST để xác định xem hai mẫu thử có xuất phát từ hai tập hợp gốc có cùng giá trị trung bình hay không.',
        abstract: 'Trả về xác suất kết hợp với Phép thử t Student. Dùng hàm TTEST để xác định xem hai mẫu thử có xuất phát từ hai tập hợp gốc có cùng giá trị trung bình hay không.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'mảng 1', detail: 'Yêu cầu. Tập dữ liệu thứ nhất.' },
            array2: { name: 'mảng 2', detail: 'Yêu cầu. Tập dữ liệu thứ hai.' },
            tails: { name: 'đặc điểm đuôi', detail: 'Yêu cầu. Xác định số phần dư của phân bố. Nếu tails = 1, hàm TTEST dùng phân bố một phía. Nếu tails = 2, hàm TTEST dùng phân bố hai phía.' },
            type: { name: 'loại Phép thử', detail: 'Yêu cầu. Kiểu phép thử t-Test cần thực hiện.' },
        },
    },
    VAR: {
        description: 'Ước tính phương sai dựa trên mẫu.',
        abstract: 'Ước tính phương sai dựa trên mẫu.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Yêu cầu. Đối số dạng số đầu tiên tương ứng với mẫu tổng thể.' },
            number2: { name: 'number2', detail: 'Tùy chọn. Là các đối số dạng số từ 2 đến 255 tương ứng với một mẫu của một tập hợp.' },
        },
    },
    VARP: {
        description: 'Tính toán phương sai dựa trên toàn bộ tập hợp.',
        abstract: 'Tính toán phương sai dựa trên toàn bộ tập hợp.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Yêu cầu. Đối số dạng số đầu tiên tương ứng với tổng thể.' },
            number2: { name: 'number2', detail: 'Tùy chọn. Là các đối số dạng số từ 2 đến 255 tương ứng với một tập hợp.' },
        },
    },
    WEIBULL: {
        description: 'Trả về phân bố Weibull. Dùng phân bố này trong phân tích độ tin cậy, chẳng hạn như tính toán tuổi thọ trung bình của một thiết bị.',
        abstract: 'Trả về phân bố Weibull. Dùng phân bố này trong phân tích độ tin cậy, chẳng hạn như tính toán tuổi thọ trung bình của một thiết bị.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'buộc. Giá trị để đánh giá hàm.' },
            alpha: { name: 'alpha', detail: 'Yêu cầu. Một tham biến tới phân phối.' },
            beta: { name: 'beta', detail: 'Yêu cầu. Một tham biến tới phân phối.' },
            cumulative: { name: 'tích lũy', detail: 'Yêu cầu. Xác định dạng hàm.' },
        },
    },
    ZTEST: {
        description: 'Trả về giá trị xác suất một phía của kiểm tra z. Đối với một trung bình tổng thể giả thuyết nhất định, μ0, hàm ZTEST trả về xác suất rằng trung độ mẫu sẽ lớn hơn trung bình quan sát trong bộ dữ liệu (mảng) — tức là, trung độ mẫu quan sát được.',
        abstract: 'Trả về giá trị xác suất một phía của kiểm tra z. Đối với một trung bình tổng thể giả thuyết nhất định, μ0, hàm ZTEST trả về xác suất rằng trung độ mẫu sẽ lớn hơn trung bình quan sát trong bộ dữ liệu (mảng) — tức là, trung độ mẫu quan sát được.',
        links: [
            {
                title: 'Hướng dẫn',
                url: 'https://support.microsoft.com/vi-vn/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'mảng', detail: 'Yêu cầu. Mảng hay khoảng dữ liệu để kiểm tra x.' },
            x: { name: 'x', detail: 'buộc. Giá trị cần kiểm tra.' },
            sigma: { name: 'Độ lệch chuẩn', detail: 'Tùy chọn. Độ lệch chuẩn tổng thể (đã biết). Nếu bỏ qua, độ lệch chuẩn mẫu sẽ được dùng.' },
        },
    },
};

export default locale;
